import { Editor, SuggestModal } from 'obsidian'
import MentionsPlugin, { PersonFile } from './main'

export class PeopleChooser extends SuggestModal<any> {
  plugin: MentionsPlugin
  editor: Editor

  constructor (plugin: MentionsPlugin, editor: Editor) {
    super(plugin.app)
    this.plugin = plugin
    this.editor = editor
  }

  getSuggestions (query: string): any[] | Promise<any[]> {
    return this.plugin.people.filter(x => x.search.includes(query.toLowerCase()))
  }

  renderSuggestion (value: PersonFile, el: HTMLElement) {
    el.setText(value.file.basename.replace(this.plugin.settings.prefix, ''))
  }

  onChooseSuggestion (item: PersonFile, _evt: MouseEvent | KeyboardEvent) {
    this.editor.replaceSelection(`[[${item.file.basename}]] `)
  }
}
