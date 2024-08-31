import { Editor, SuggestModal, TFile } from 'obsidian'
import MentionsPlugin from './main'

export interface PersonFile {
  file: TFile;
  search: string;
  inlinks: number; // Number of notes linking to this file
}

export class PeopleChooser extends SuggestModal<any> {
  plugin: MentionsPlugin
  people: PersonFile[]
  editor: Editor

  constructor (plugin: MentionsPlugin, editor: Editor) {
    super(plugin.app)
    this.plugin = plugin
    this.editor = editor

    this.people = this.getPeople()
  }

  getSuggestions (query: string): any[] | Promise<any[]> {
    return this.people.filter(x => x.search.includes(query.toLowerCase()))
  }

  renderSuggestion (value: PersonFile, el: HTMLElement) {
    el.setText(value.file.basename.replace(this.plugin.settings.prefix, ''))
  }

  onChooseSuggestion (item: PersonFile, _evt: MouseEvent | KeyboardEvent) {
    this.editor.insertText(`[[${item.file.basename}]] `)
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
    return people
  }
}
