const {Menu} = require('electron')
const electron = require('electron')
const app = electron.app
const openAboutWindow = require('about-window').default;

const template = []

if (process.platform === 'darwin') {
    const name = app.getName()
    template.unshift({
        label: name,
        submenu: [
            {
                label: 'About',
                click: () =>
                    openAboutWindow({
                        icon_path: __dirname + '/project-clock.png',
                        product_name: 'Project-Clock',
                        bug_report_url: 'https://github.com/richlab/project-clock/issues',
                        homepage: 'https://www.richlab.de',
                        copyright: 'Copyright © 2018 by Richlab',
                        win_options: {
                            minimizable: false,
                            maximizable: false,
                            resizable: false,
                        }
                    }),
            },
            {
                label: 'Quit',
                role: 'quit'
            }
        ]
    },{
            label: "Edit",
            submenu: [
                { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
                { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
                { type: "separator" },
                { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
                { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
                { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
                { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }]
        }
        )
}

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)