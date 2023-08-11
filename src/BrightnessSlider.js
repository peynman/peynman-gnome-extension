
'use strict';

const { Clutter, Gio, GLib, GObject, Shell, St } = imports.gi;

const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const PopupMenuItem = PopupMenu.PopupMenuItem;
const SystemActions = imports.misc.systemActions;
const ExtensionUtils = imports.misc.extensionUtils;
const GnomeSession = imports.misc.gnomeSession;

const { QuickToggle, SystemIndicator, QuickSettingsItem, QuickSlider } = imports.ui.quickSettings;

const {loadInterfaceXML} = imports.misc.fileUtils;

const BUS_NAME = 'org.gnome.SettingsDaemon.Power';
const OBJECT_PATH = '/org/gnome/SettingsDaemon/Power';

const BrightnessInterface = loadInterfaceXML('org.gnome.SettingsDaemon.Power.Screen');
const BrightnessProxy = Gio.DBusProxy.makeProxyWrapper(BrightnessInterface);

function debugObject(obj, types = ['string', 'function', 'boolean', 'array', 'object']) {
    for (var i in obj) {
        if (types.includes(typeof obj[i])) {
            log(`<${typeof obj[i]}> ${i} = ${obj[i]}`)
        } else {
            log(`<${typeof obj[i]}> ${i}`)
        }
    }
}

var BrightnessSliderMenuItem = GObject.registerClass(
    class BrightnessSliderMenuItem extends QuickSlider {
        _init() {
            super._init({
                iconName: 'display-brightness-symbolic',
            });
    
            this._proxy = new BrightnessProxy(Gio.DBus.session, BUS_NAME, OBJECT_PATH,
                (proxy, error) => {
                    if (error)
                        console.error(error.message);
                    else
                        this._proxy.connect('g-properties-changed', () => this._sync());
                    this._sync();
                    console.log('Ready')
                    console.log(error)
                    debugObject(proxy)
                });
    
            this._sliderChangedId = this.slider.connect('notify::value', this._sliderChanged.bind(this));
            this.slider.accessible_name = _('Brightness');

            Main.panel.statusArea.quickSettings.menu.addItem(this, 2)
        }
    
        _sliderChanged() {
            const percent = this.slider.value * 100;
            this._proxy.Brightness = percent;
        }
    
        _changeSlider(value) {
            this.slider.block_signal_handler(this._sliderChangedId);
            this.slider.value = value;
            this.slider.unblock_signal_handler(this._sliderChangedId);
        }
    
        _sync() {
            log('Reading brightness')
            const brightness = this._proxy.Brightness;
            log(brightness)
            // const visible = Number.isInteger(brightness) && brightness >= 0;
            // this.visible = visible;
            // if (visible)
            //     this._changeSlider(this._proxy.Brightness / 100.0);
        }
    
    }
)