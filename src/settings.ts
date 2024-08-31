import { App, PluginSettingTab, Setting } from 'obsidian'
import MentionsPlugin from './main'

export interface MentionsSettings {
  prefix: string;
}

export const DEFAULT_SETTINGS: MentionsSettings = {
  prefix: '👤'
}

export class MentionsSettingTab extends PluginSettingTab {
  plugin: MentionsPlugin

  constructor (app: App, plugin: MentionsPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display (): void {
    const { containerEl } = this

    containerEl.empty()

    new Setting(containerEl)
      .setName('Link prefix')
      .addText(text => text
        .setValue(this.plugin.settings.prefix)
        .onChange(async value => {
          this.plugin.settings.prefix = value
          await this.plugin.saveSettings()
        }))
  }
}
