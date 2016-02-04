import WebTorrent from 'webtorrent'

let torrentClient = new WebTorrent({maxConns: 10})
let reportTimer;
let fs = require("fs")
let through = require("through2")

function updateTorrentState (torrent) {
  let recipient = "torrent"
  let action    = "update"
  let data      = {
    infoHash: torrent.infoHash,
    name: torrent.name,
    downloadSpeed: torrent.downloadSpeed,
    uploadSpeed: torrent.uploadSpeed,
    progress: torrent.progress,
    downloaded: torrent.downloaded,
    uploaded: torrent.uploaded,
    timeRemaining: torrent.timeRemaining
  }
  chrome.runtime.sendMessage("kechjjcjfbniofinibgojemmindijlbj", {recipient, action, data})
}


function writeToDisk(torrent) {
  torrent.files.forEach((file) => {
    window.currentFile = file
    chrome.storage.local.get('filesystemKey', function(items) {
      var fileSystemRef = items.filesystemKey;
    })
  })
}

function updateClientState() {
  let recipient = "client"
  let action = "update"
  let data = {
    downloadSpeed: torrentClient.downloadSpeed,
    uploadSpeed: torrentClient.uploadSpeed,
    downloadThrottle: 0, // Throttle not yet implemented in Webtorrent
    uploadThrottle: 0
  }
  chrome.runtime.sendMessage("kechjjcjfbniofinibgojemmindijlbj", {recipient, action, data})
}

function updateState() {
  torrentClient.torrents.forEach((torrent) => {
    updateTorrentState(torrent)
  })
  updateClientState()
  reportTimer = setTimeout(updateState, 1000)
}

chrome.runtime.onMessageExternal.addListener(function (message) {
  if (message.action === "add") {
    torrentClient.add(message.magnetUri, {path: "/"}, (torrent) => {
      torrent.on("download", updateTorrentState.bind(this, torrent))
      torrent.on("upload", updateTorrentState.bind(this, torrent))
      torrent.on("done", updateTorrentState.bind(this, torrent))
    })
  }
})

chrome.runtime.onInstalled.addListener(updateState)
chrome.runtime.onInstalled.addListener(() => {
  chrome.app.window.create("settings.html", (settingsWindow) => {
    settingsWindow.onClosed.addListener(() => {
      console.log("settings window closed")
      chrome.storage.local.get('filesystemKey', function(items) {
        console.log("got filesystemref")
        let fileSystemRef = items.filesystemKey
        chrome.fileSystem.restoreEntry(fileSystemRef, function (fileSystem) {
          console.log("setting entry in fs:", fileSystem)
          fs.entry = fileSystem
        })
      })
    })
  })
})
chrome.runtime.onStartup.addListener(updateState)
