import { Editor, MarkdownView, Plugin, TFile } from 'obsidian'
import { PeopleChooser } from './chooser'
import { DEFAULT_SETTINGS, MentionsSettings, MentionsSettingTab } from './settings'

export interface PersonFile {
  file: TFile;
  search: string;
  inlinks: number; // Number of notes linking to this file
}

export default class MentionsPlugin extends Plugin {
  settings: MentionsSettings
  status: HTMLSpanElement
  people: PersonFile[]

  async onload () {
    await this.loadSettings()
    this.addSettingTab(new MentionsSettingTab(this.app, this))

    // Populate the people array. This happens only on plugin startup to improve suggest modal
    // response time.
    this.getPeople()

    const item = this.addStatusBarItem()
    this.status = item.createEl('span')

    this.registerEvent(this.app.workspace.on('editor-change', (_editor, info) => {
      if (info.file instanceof TFile) this.updateStatus(info.file)
    }))

    this.registerEvent(this.app.workspace.on('file-open', (file) => {
      if (file) this.updateStatus(file)
    }))

    this.addCommand({
      id: 'mention-person',
      name: 'Mention person',
      editorCallback: async (editor: Editor, _view: MarkdownView) => {
        if (this.app.workspace.getActiveViewOfType(MarkdownView)) {
          new PeopleChooser(this, editor).open()
        }
      }
    })

    this.addCommand({
      id: 'update',
      name: 'Update people',
      callback: () => this.getPeople()
    })
  }

  updateStatus (file: TFile) {
    const cache = this.app.metadataCache.getFileCache(file)
    const people = cache?.links
      ?.filter(link => link.link.startsWith(this.settings.prefix))
      ?.map(link => link.link)
      ?.sort((a, b) => a.localeCompare(b))

    const status = people ? [...new Set(people)].join(' ') : '' // Set() to remove any duplicates

    // Not sure if it's preferable to check the value first, but it might be beneficial if
    // it prevents needless DOM updates?
    if (this.status.textContent !== status) {
      this.status.textContent = status
    }
  }

  async loadSettings () {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings () {
    await this.saveData(this.settings)
  }

  /**
   * Get a list of all people in the vault, ordered by number of notes linking to this person descending
   */
  getPeople () {
    const people: PersonFile[] = []
    this.app.vault.getFolderByPath('People')?.children.forEach(child => {
      if (child instanceof TFile && child.extension === 'md') {
        people.push({
          file: child,
          search: child.basename.toLowerCase(),
          inlinks: Object.keys(this.app.metadataCache.getBacklinksForFile(child).data).length
        })
      }
    })
    people.sort((a, b) => b.inlinks - a.inlinks)
    this.people = people
  }
}