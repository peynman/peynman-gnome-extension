
'use strict';

const { Clutter, Gio, GLib, GObject, Shell, St, GnomeDesktop } = imports.gi;

const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const PopupMenuItem = PopupMenu.PopupMenuItem;
const SystemActions = imports.misc.systemActions;
const ExtensionUtils = imports.misc.extensionUtils;
const GnomeSession = imports.misc.gnomeSession;

const { QuickToggle, SystemIndicator, QuickSettingsItem, QuickSlider } = imports.ui.quickSettings;

var RestartToWindowsMenuItem = GObject.registerClass(
    class RestartToWindows extends PopupMenuItem {
        _init() {
            super._init(
                _('Restart to windows...'),
                {}
            );
            this._systemActions = new SystemActions.getDefault();

            // this._settings = new Gio.Settings({
            //     schema_id: 'org.gnome.desktop.interface',
            // });
            // this._changedId = this._settings.connect('changed::color-scheme',
            //     () => this._sync()
            // );

            this.connect('activate', (o, event) => {
                this._executeRestart();
            });

            Main.panel.statusArea.quickSettings._system._systemItem.menu.addMenuItem(this, 2);
        }


        spawnCommandLine(commandLine) {
            try {
                let [success_, argv] = GLib.shell_parse_argv(commandLine);
                this.trySpawn(argv);
            } catch (err) {
                this._handleSpawnError(commandLine, err);
            }
        }

        trySpawn(argv) {
            var success_, pid;
            try {
                [success_, pid] = GLib.spawn_async(
                    null, argv, null,
                    GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD,
                    () => {
                        try {
                            global.context.restore_rlimit_nofile();
                        } catch (err) {
                        }
                    }
                );
            } catch (err) {
                /* Rewrite the error in case of ENOENT */
                if (err.matches(GLib.SpawnError, GLib.SpawnError.NOENT)) {
                    throw new GLib.SpawnError({
                        code: GLib.SpawnError.NOENT,
                        message: _('Command not found'),
                    });
                } else if (err instanceof GLib.Error) {
                    // The exception from gjs contains an error string like:
                    //   Error invoking GLib.spawn_command_line_async: Failed to
                    //   execute child process "foo" (No such file or directory)
                    // We are only interested in the part in the parentheses. (And
                    // we can't pattern match the text, since it gets localized.)
                    let message = err.message.replace(/.*\((.+)\)/, '$1');
                    throw new err.constructor({ code: err.code, message });
                } else {
                    throw err;
                }
            }
        
            // Async call, we don't need the reply though
            GnomeDesktop.start_systemd_scope(argv[0], pid, null, null, null, () => {});
        
            // Dummy child watch; we don't want to double-fork internally
            // because then we lose the parent-child relationship, which
            // can break polkit.  See https://bugzilla.redhat.com//show_bug.cgi?id=819275
            GLib.child_watch_add(GLib.PRIORITY_DEFAULT, pid, () => {});
        }

        _handleSpawnError(command, err) {
            let title = _("Execution of “%s” failed:").format(command);
            Main.notifyError(title, err.message);
        }

        _executeRestart() {
            this.spawnCommandLine(`grub-reboot 2`);
            this._systemActions.activateRestart();
            Main.panel.closeQuickSettings();
        }

        _sync() {

        }
    }
)