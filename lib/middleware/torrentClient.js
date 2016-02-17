import { addTorrent, updateTorrent, removeTorrent, deleteTorrent } from '../actions/torrent-actions'
import { updateClient } from '../actions/client-actions'
import WebTorrent from 'webtorrent'

let reportTimer = null
let client      = null

const reportState = (store) => {
  store.dispatch(updateClient({
    downloadSpeed: client.downloadSpeed, 
    uploadSpeed: client.uploadSpeed
  }))
  reportTimer = setTimeout(reportState.bind(reportState, store), 1000)
}

export function torrentClient(store) {
  return next => action => {
    const result = next(action)
    if (client) {
      switch (action.type) {
        case 'ADD_TORRENT':
          client.add(action.magnetUri, {path: "./"}, (torrent) => {
            torrent.on("download", store.dispatch.bind(store, updateTorrent(torrent)))
            torrent.on("upload", store.dispatch.bind(store, updateTorrent(torrent)))
            torrent.on("done", store.dispatch.bind(store, updateTorrent(torrent)))
          })
          break
        case 'REMOVE_TORRENT':
          client.remove(action.data, (err) => {
            store.dispatch(deleteTorrent(action.data))
          })
      }
    }
    return result
  }
}

export default function (store) {
  client = new WebTorrent({maxConns: 10})
  reportState(store)
}
