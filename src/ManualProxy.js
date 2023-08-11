
'use strict';

const { Clutter, Gio, GLib, GObject, Shell, St } = imports.gi;

const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const PopupMenuItem = PopupMenu.PopupMenuItem;
const SystemActions = imports.misc.systemActions;
const ExtensionUtils = imports.misc.extensionUtils;
const GnomeSession = imports.misc.gnomeSession;

const { QuickToggle, SystemIndicator, QuickSettingsItem, QuickSlider, QuickMenuToggle } = imports.ui.quickSettings;

const PROXY_SCHEMA = "org.gnome.system.proxy"
const PROXY_MODE = "mode"

// possible proxy modes and their text representation.
const modeText = {
    'none': "Off",
    'manual': "Manual",
    'auto': "Automatic"
};
const modeList = ['none', 'manual', 'auto'];


class ModeMenuItem {
    // A class that wraps a menu item associated with a proxy mode.
    constructor(mode, callback) {
        this.mode = mode;
        this.item = new PopupMenu.PopupMenuItem(_(modeText[mode]));
        this.connectionId = this.item.connect("activate", callback);
    }

    destroy() {
        this.item.disconnect(this.connectionId);
        this.item.destroy();
    }
}

var ManualProxyMenuItem = GObject.registerClass(
    class ManualProxyMenuItem extends QuickMenuToggle {
        _init() {
            // make the menu
            super._init({
                title: _("Proxy"),
                iconName: "preferences-system-network-proxy-symbolic",
            });

            // connect to the gsettings proxy schema
            if (Gio.Settings.list_schemas().indexOf(PROXY_SCHEMA) == -1)
                throw _("Schema \"%s\" not found.").format(PROXY_SCHEMA);
            this._settings = new Gio.Settings({ schema: PROXY_SCHEMA });

            this.menu.setHeader("preferences-system-network-proxy-symbolic", _("Proxy"));

            this.connectObject(
                'destroy', () => this.disposeResourses(),
                'clicked', () => this.menu.open(),
                this);


            this._settingsConnectionId = this._settings.connect(
                'changed::' + PROXY_MODE, () => this._sync(),
            );

            // add menu item for each mode.
            this.items = [];
            for (const mode of modeList) {
                const item = new ModeMenuItem(mode, () => {
                    this._settings.set_string(PROXY_MODE, mode);
                });
                this.items.push(item);
                this.menu.addMenuItem(item.item);
            }

            // Add a link to launch network settings.
            this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
            this.menu.addSettingsAction(_("Network Settings"), 'gnome-network-panel.desktop');

            this._sync();

            Main.panel.statusArea.quickSettings.menu.addItem(this)
        }

        _sync() {
            const mode = this._settings.get_string(PROXY_MODE);
            if (mode == "none") {
                this.checked = false;
                this.subtitle = null;
            } else {
                this.checked = true;
                this.subtitle = _(modeText[mode]);
            }

            for (const item of this.items) {
                item.item.setOrnament(
                    (mode == item.mode) ? PopupMenu.Ornament.DOT
                        : PopupMenu.Ornament.NONE);
            }
        }

        disposeResourses() {
            this._settings.run_dispose()
            for (const item of this.items) {
                item.destroy();
            }
            this.items = [];
        }
    }
)