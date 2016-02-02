import WebTorrent from 'webtorrent'

let torrentClient = new WebTorrent({maxConns: 10})
let reportTimer;
let through = require("through2")


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


function writeToDisk(torrent) {
  torrent.files.forEach((file) => {
    window.currentFile = file
    chrome.storage.local.get('filesystemKey', function(items) {
      var fileSystemRef = items.filesystemKey;
      chrome.fileSystem.restoreEntry(fileSystemRef, function (fileSystem) {
        console.log("file.name is:", file.name)
        fileSystem.getFile(file.name, { create: true }, function (fileEntry) {
          fileEntry.createWriter(function(writer) {
            window.currentWriter = writer
            writer.truncate(0)
            writer.onwriteend = function() {
              writer.onwriteend = undefined
              file.createReadStream().pipe(through(function(chunk, enc, cb) {
                if (!(chunk instanceof Uint8Array)) {
                  chunk = new Uint8Array(chunk)
                  console.log("in if")
                }
                window.currentChunk = chunk
                let chunkBlob = new Blob([chunk.toString()], {type: 'text/plain'})
                writer.seek(writer.length) // TODO: next step is to try to write buffer directly writer.write(chunk.buffer)
                writer.write(chunkBlob)
                writer.onwriteend = function () {
                  writer.onwriteend = undefined
                  chunkBlob = undefined
                  cb()
                }
              }, function(cb) {
                console.log("finished stream")
                cb()
              }))
            }
          })
        })
      })
    })
  })
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

function updateState() {
  torrentClient.torrents.forEach((torrent) => {
    updateTorrentState(torrent)
  })
  updateClientState()
  reportTimer = setTimeout(updateState, 1000)
}

chrome.runtime.onMessageExternal.addListener(function (message) {
  if (message.action === "add") {
    torrentClient.add(message.magnetUri, (torrent) => {
      torrent.on("download", updateTorrentState.bind(this, torrent))
      torrent.on("upload", updateTorrentState.bind(this, torrent))
      torrent.on("done", updateTorrentState.bind(this, torrent))
      torrent.on("done", writeToDisk.bind(this, torrent))
    })
  }
})

chrome.runtime.onInstalled.addListener(updateState)
chrome.runtime.onInstalled.addListener(() => {
  chrome.app.window.create("settings.html")
})
chrome.runtime.onStartup.addListener(updateState)
