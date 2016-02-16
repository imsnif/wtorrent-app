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
          console.log("adding torrent")
          client.add(action.magnetUri, {path: "./"}, (torrent) => {
            console.log("added:", torrent)
            torrent.on("download", store.dispatch.bind(store, updateTorrent(torrent)))
            torrent.on("upload", store.dispatch.bind(store, updateTorrent(torrent)))
            torrent.on("done", store.dispatch.bind(store, updateTorrent(torrent)))
          })
        case 'REMOVE_TORRENT':
          // TODO: remove from client and unsubscribe
      }
    }
    return result
  }
}

export default function (store) {
  client = new WebTorrent({maxConns: 10})
  reportState(store)
}
