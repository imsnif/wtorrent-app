import { addTorrent, updateTorrent, removeTorrent, deleteTorrent } from '../actions/torrent-actions'
import { updateClient } from '../actions/client-actions'
import fs from 'fs'
import WebTorrent from 'webtorrent'

function updateFsEntry() {
  if (fs.entry === "undefined") {
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
  }
}

export function chromeMessageMiddleware(store) {
  return next => action => {
    const result = next(action)
    updateFs()
    return result
  }
}

export default function (store) {
  chrome.runtime.onInstalled.addListener(updateFsEntry)
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
}
