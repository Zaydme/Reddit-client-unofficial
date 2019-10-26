const { app, BrowserWindow, Menu, shell } = require('electron');


let win
app.on('ready', () => {

    win = new BrowserWindow({
        title: 'Reddit',
        icon: __dirname + '/favicon.ico',
        webPreferences: {
            nodeIntegration: false
        }
    });

    win.loadURL('https://www.reddit.com/');
    win.maximize();
    
    win.webContents.on('did-finish-load', function() {
        startRichPresence()
    });

    win.webContents.on('new-window', (event, url) => {
        event.preventDefault()
        win.loadURL(url)
    })
    
    win.on('closed', () => {
        win = null
    })

});




/* DISCORD Rich Presence  */
let client
let startedRpClient = false

function startRpClient() {
    startedRpClient = true
    client = require('discord-rich-presence')('637398389478391808')
    startRichPresence();
}

setInterval(() => {
    if (!startedRpClient) startRpClient()
}, 10e3);

function startRichPresence() {

    if (!startedRpClient) return
    let startTime = Date.now()

    setActivity();

    function setActivity() {
        let sub = getSubReddit()
        let title = getPageTitle()
        client.updatePresence({
            state: title,
            details: sub,
            startTimestamp: startTime,
            largeImageKey: 'reddit-icon',
            largeImageText: 'Reddit'
        })
    }

    setInterval(() => {
        setActivity();
    }, 15e3);

}


/* OTHER FUNCTIONS */
function getSubReddit() {
    let currentURL = win.webContents.getURL();
    let path = currentURL.substring('https://www.reddit.com/'.length)
    if (path.length == 0) return "Home page"
    path = path.split("/")
    if (path.length >= 2 && path[0] == "search") return "Searching..."
    if (path.length >= 2 && (path[0] == "user" || path[0] == "r")) return `${path[0].replace("user","u")}/${path[1]}`
    return "Browsing Reddit"
}

function getPageTitle() {
    return win.webContents.getTitle();
}

// i shouldn't use this but ok
process.on('unhandledRejection', error => {
    startedRpClient = false
    console.log('are you sure discord is open?');
});



/* MENU */

let template = [{
        label: 'Back',
        click: () => win.webContents.goBack()
    },
    {
        label: 'Refresh',
        role: 'reload'
    },
    {
        label: 'Contribute on GitHub',
        click: () => shell.openExternal("https://github.com/Zaydme/Reddit-client-unofficial")
    }
]
let menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu);
