'use strict'

const { Adw, Gio, Gtk } = imports.gi

const ExtensionUtils = imports.misc.extensionUtils
const Me = ExtensionUtils.getCurrentExtension()

function init () {}

function fillRestartToWindowsPreference (window, settings) {
  // Create a preferences page and group
  const page = new Adw.PreferencesPage()
  const group = new Adw.PreferencesGroup()
  page.add(group)

  // Create a new preferences row
  const row = new Adw.ActionRow({ title: 'Show Restart to windows' })
  group.add(row)

  const toggle = new Gtk.Switch({
    active: settings.get_boolean('show-restart-to-windows'),
    valign: Gtk.Align.CENTER
  })
  settings.bind(
    'show-restart-to-windows',
    toggle,
    'active',
    Gio.SettingsBindFlags.DEFAULT
  )

  // Add the switch to the row
  row.add_suffix(toggle)
  row.activatable_widget = toggle

  return page
}

function fillPreferencesWindow (window) {
  // Use the same GSettings schema as in `extension.js`
  const settings = ExtensionUtils.getSettings(
    'org.gnome.shell.extensions.peynman'
  )

  // Add our pages to the window
  window.add(fillRestartToWindowsPreference(window, settings))
}
