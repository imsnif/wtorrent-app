import { addTorrent, updateTorrent, removeTorrent, deleteTorrent } from '../actions/torrent-actions'
import { updateClient } from '../actions/client-actions'
import WebTorrent from 'webtorrent'

let updateTimer = null
let client      = null

const updateClientState = (store) => {
  store.dispatch(updateClient({
    downloadSpeed: client.downloadSpeed, 
    uploadSpeed: client.uploadSpeed
  }))
  updateTimer = setTimeout(updateClientState.bind(updateClientState, store), 1000)
}

const addTorrentToClient = (store, magnetUri) => {
  client.add(magnetUri, {path: "./"}, (torrent) => {
    torrent.on("download", store.dispatch.bind(store, updateTorrent(torrent)))
    torrent.on("upload", store.dispatch.bind(store, updateTorrent(torrent)))
    torrent.on("done", store.dispatch.bind(store, updateTorrent(torrent)))
  })
}

const removeTorrentFromClient = (store, torrentId) => {
  client.remove(torrentId, (err) => {
    store.dispatch(deleteTorrent(torrentId))
  })
}

export function torrentClient(store) {
  return next => action => {
    const result = next(action)
    if (client) {
      switch (action.type) {
        case 'ADD_TORRENT':
          addTorrentToClient(store, action.magnetUri)
          break
        case 'REMOVE_TORRENT':
          removeTorrentFromClient(store, action.data)
          break
      }
    }
    return result
  }
}

export default function (store) {
  client = new WebTorrent({maxConns: 10})
  updateClientState(store)
}
