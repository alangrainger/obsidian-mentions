import { Plugin, TFile } from 'obsidian'

export default class MentionsPlugin extends Plugin {
  status: HTMLSpanElement

  async onload () {
    const item = this.addStatusBarItem();
    this.status = item.createEl("span");

    this.registerEvent(this.app.workspace.on('editor-change', (_editor, info) => {
      if (info.file instanceof TFile) this.updateStatus(info.file)
    }))

    this.registerEvent(this.app.workspace.on('file-open', (file) => {
      if (file) this.updateStatus(file)
    }))
  }

  updateStatus (file: TFile) {
    const cache = this.app.metadataCache.getFileCache(  file)
    const people = cache?.links
      ?.filter(link => link.link.includes('👤'))
      ?.map(link => link.link)
      ?.sort((a, b) => a.localeCompare(b))

    const status = people ? [...new Set(people)].join(' ') : '' // Set() to remove any duplicates

    // Not sure if it's preferable to check the value first, but it might be beneficial if
    // it prevents needless DOM updates?
    if (this.status.textContent !== status) {
      this.status.textContent = status
    }
  }
}
