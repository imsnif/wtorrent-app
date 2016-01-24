import WebTorrent from 'webtorrent'

let torrentClient = new WebTorrent({maxConns: 10})

function updateTorrentState (torrent) {
  let action = "update"
  let data = { 
    infoHash: torrent.infoHash,
    name: torrent.name,
    downloadSpeed: torrent.downloadSpeed,
    uploadSpeed: torrent.uploadSpeed,
    progress: torrent.progress,
    downloaded: torrent.downloaded,
    uploaded: torrent.uploaded
  }
  chrome.runtime.sendMessage("kechjjcjfbniofinibgojemmindijlbj", {action, data})
}

chrome.runtime.onMessageExternal.addListener(function (message) {
  if (message.action === "add") {
    torrentClient.add(message.magnetUri, (torrent) => {
      torrent.on("download", updateTorrentState.bind(this, torrent))
      torrent.on("upload", updateTorrentState.bind(this, torrent))
      torrent.on("done", updateTorrentState.bind(this, torrent))
    })
  } else if (message.action === "getState") {
    torrentClient.torrents.forEach((torrent) => {
      updateTorrentState(torrent)
    })
  }
})
