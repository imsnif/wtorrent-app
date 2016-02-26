import { addTorrent, updateTorrent, removeTorrent, deleteTorrent } from '../actions/torrent-actions'
import { updateClient } from '../actions/client-actions'
import WebTorrent from 'webtorrent'

const MAX_RETRIES    = 5
const RETRY_INTERVAL = 20000
let updateTimer      = null
let client           = null

const updateClientState = (store) => {
  store.dispatch(updateClient({
    downloadSpeed: client.downloadSpeed, 
    uploadSpeed: client.uploadSpeed
  }))
  updateTimer = setTimeout(updateClientState.bind(updateClientState, store), 1000)
}

const addTorrentToClient = function (store, magnetUri) {
  this.retries = this.retries || 0
  const torrent = client.add(magnetUri, {path: "./"}, (torrent) => {
    torrent.on("download", store.dispatch.bind(store, updateTorrent(torrent)))
    torrent.on("upload", store.dispatch.bind(store, updateTorrent(torrent)))
    torrent.on("done", store.dispatch.bind(store, updateTorrent(torrent)))
    clearTimeout(timeout)
  })
  const timeout = setTimeout(removeTorrentFromClient.bind(this, store, torrent), RETRY_INTERVAL)
}

const removeTorrentFromClient = function (store, torrent) {
  const torrentId = typeof torrent === "string" ? torrent : torrent.infoHash
  client.remove(torrentId, (err) => {
    if (this.retries !== undefined) {
      this.retries += 1
      if (this.retries > MAX_RETRIES) return store.dispatch(deleteTorrent(torrent.infoHash)) // TODO: report error
      return addTorrentToClient.call(this, store, torrent.magnetURI)
    }
    store.dispatch(deleteTorrent(torrentId))
  })
}

export function torrentClient(store) {
  return next => action => {
    const result = next(action)
    if (client) switch (action.type) {
      case 'ADD_TORRENT':
        addTorrentToClient.call({}, store, action.magnetUri)
        break
      case 'REMOVE_TORRENT':
        removeTorrentFromClient.call({}, store, action.data)
        break
    }
    return result
  }
}

export default function (store) {
  client = new WebTorrent({maxConns: 10})
  updateClientState(store)
}
