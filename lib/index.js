//import WebTorrent from 'webtorrent'
import { createStore, applyMiddleware } from 'redux'
import torrentApp from './reducers'
import { addTorrent, updateTorrent, updateClient } from './actions/torrent-actions'
import initClient, { torrentMiddleware } from './middleware/torrentClient'

const createStoreWithMiddleware = applyMiddleware(torrentMiddleware)(createStore)
const store = createStoreWithMiddleware(torrentApp)
initClient(store)

const fs = require("fs")

store.subscribe(() => {
  const state = store.getState()
  state.torrents.forEach((torrent) => {
    chrome.runtime.sendMessage("kechjjcjfbniofinibgojemmindijlbj", updateTorrent(torrent))
  })
  chrome.runtime.sendMessage("kechjjcjfbniofinibgojemmindijlbj", updateClient(state.client))
})

chrome.runtime.onMessageExternal.addListener(function (message) {
  store.dispatch(addTorrent(message.magnetUri))
})

chrome.runtime.onInstalled.addListener(() => {
  chrome.app.window.create("settings.html", (settingsWindow) => {
    settingsWindow.onClosed.addListener(() => {
      chrome.storage.local.get('filesystemKey', function(items) {
        const fileSystemRef = items.filesystemKey
        chrome.fileSystem.restoreEntry(fileSystemRef, function (fileSystem) {
          fs.entry = fileSystem
        })
      })
    })
  })
})
