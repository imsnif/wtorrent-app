import { updateTorrent} from '../actions/torrent-actions'
import { updateClient } from '../actions/client-actions'
import fs from 'fs'

let reportTimer = null

const updateFsEntry = () => {
  if (fs.entry === undefined) {
    fs.entry = null // Temporarily set to avoid race condition
    chrome.app.window.create("settings.html", (settingsWindow) => {
      settingsWindow.onClosed.addListener(setFsEntry)
    })
  }
}

const setFsEntry = () => {
  chrome.storage.local.get('filesystemKey', (items) => {
    const fileSystemRef = items.filesystemKey
    chrome.fileSystem.restoreEntry(fileSystemRef, (fileSystem) => {
      fs.entry = fileSystem
    })
  })
}

const reportState = (store) => {
  const state = store.getState()
  state.torrents.forEach((torrent) => {
    chrome.runtime.sendMessage("kechjjcjfbniofinibgojemmindijlbj", updateTorrent(torrent))
  })  
  chrome.runtime.sendMessage("kechjjcjfbniofinibgojemmindijlbj", updateClient(state.client))
  reportTimer = setTimeout(reportState.bind(reportState, store), 1000)
}

export function chromeMessage(store) {
  return next => action => {
    const result = next(action)
    switch (action.type) {
      case "DELETE_TORRENT":
        chrome.runtime.sendMessage("kechjjcjfbniofinibgojemmindijlbj", action)
    }
    updateFsEntry()
    return result
  }
}

export default function (store) {
  chrome.runtime.onInstalled.addListener(updateFsEntry)
  reportState(store)
  chrome.runtime.onMessageExternal.addListener((message, sender) => {
    if (sender.id === "kechjjcjfbniofinibgojemmindijlbj") {
      store.dispatch(message)
    }
  })
}
