import WebTorrent from 'webtorrent'

let torrentClient = new WebTorrent({maxConns: 10})

chrome.runtime.onMessageExternal.addListener(function (magnetUri) {
  torrentClient.add(magnetUri, (torrent) => {
    console.log("added")
    torrent.on("download", function(chunkSize) {
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
    })
  })
})
