# My Gnome customizations

### Restart to windows
Adds restart to windows item to the restart menu.
#### Allow non sudo users to execute a particular command
* add new file `etc/sudoers.d/grub-reboot-sudoless`
* paste following in the file: `ALL ALL=NOPASSWD: /usr/bin/grub-reboot`

---
### Manual Proxy
Allow changing global proxy within quick settings menu.

---
### Brightness Slider
Add brightness slider for external monitors with ddcutil support.
