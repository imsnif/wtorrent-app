//import WebTorrent from 'webtorrent'
import { createStore } from 'redux'
import torrentApp from './reducers'
import { addTorrent } from './actions/torrent-actions'

const store = createStore(torrentApp)

let fs = require("fs")

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

chrome.runtime.onMessageExternal.addListener(function (message) {
  store.dispatch(addTorrent(message.magnetUri))
})

chrome.runtime.onInstalled.addListener(() => {
  chrome.app.window.create("settings.html", (settingsWindow) => {
    settingsWindow.onClosed.addListener(() => {
      chrome.storage.local.get('filesystemKey', function(items) {
        let fileSystemRef = items.filesystemKey
        chrome.fileSystem.restoreEntry(fileSystemRef, function (fileSystem) {
          fs.entry = fileSystem
        })
      })
    })
  })
})
