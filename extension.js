
'use strict';

const { Clutter, Gio, GLib, GObject, Shell, St, Meta } = imports.gi;

const Main = imports.ui.main;
const Config = imports.misc.config;
const ExtensionUtils = imports.misc.extensionUtils;

const SHELL_MAJOR_VERSION = parseInt(Config.PACKAGE_VERSION.split('.')[0]);
const Me = ExtensionUtils.getCurrentExtension();
const RestartToWindowsMenuItem = Me.imports.src.RestartToWindows.RestartToWindowsMenuItem;
const ManualProxyMenuItem = Me.imports.src.ManualProxy.ManualProxyMenuItem;
const BrightnessSliderMenuItem = Me.imports.src.BrightnessSlider.BrightnessSliderMenuItem;
const { Workspace } = imports.ui.workspace;

const isOverviewWindow = Workspace.prototype._isOverviewWindow;

function getActiveWindow() {
	return global.display.focus_window;
}

let SessionManager = null;

class Extension {
    constructor() {
        this._restartToWindows = null;
        this._toggleProxy = null;
        this._brightness = null;
    }

    debugObject(obj, types = ['string', 'function', 'boolean', 'array', 'object']) {
        for (var i in obj) {
            if (types.includes(typeof obj[i])) {
                log(`<${typeof obj[i]}> ${i} = ${obj[i]}`)
            } else {
                log(`<${typeof obj[i]}> ${i}`)
            }
        }
    }

    enable() {
        log(`enabling ${Me.metadata.name}`);
        // log(Me.imports.RestartToWindows)

        log(Main.panel.statusArea.quickSettings.menu.prototype)
        this.debugObject(Main.panel.statusArea.quickSettings.menu, ['function', 'string', 'boolean'])
        // this.debugObject(Main.panel.statusArea.quickSettings.menu.prototype, ['function', 'string', 'boolean'])

        this.settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.peynman');

        this._restartToWindows = new RestartToWindowsMenuItem();
        this._toggleProxy = new ManualProxyMenuItem();
        this._brightness = new BrightnessSliderMenuItem();

        this.settings.bind(
            'show-restart-to-windows',
            this._restartToWindows,
            'visible',
            Gio.SettingsBindFlags.DEFAULT
        );
        
		// override method:
		// only show windows from active application
		// Workspace.prototype._isOverviewWindow = (win) => {
		// 	const activeWindow = getActiveWindow();
		// 	return (!activeWindow)
		// 		? isOverviewWindow(win)
		// 		: (activeWindow.wm_class == win.wm_class);
		// };
		// Main.overview.toggle();
    }

    disable() {
        log(`disabling ${Me.metadata.name}`);
        this._restartToWindows.destroy();
        this._restartToWindows = null;

        this._toggleProxy.destroy();
        this._toggleProxy = null;
    
        this._brightness.destroy();
        this._brightness = null;

        this.settings = null;
    }
}

function init() {
    return new Extension();
}
