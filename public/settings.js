window.addEventListener('load', function() {
  document.getElementById('close').addEventListener('click', function() {
    window.close()
  })
  document.getElementById('input').addEventListener('click', function() {

    chrome.fileSystem.chooseEntry({type: 'openDirectory'}, function(entry) {
      var homeDirectory = chrome.fileSystem.retainEntry(entry);

      chrome.storage.local.set({'filesystemKey': homeDirectory}, function() {
        window.close();
      });           
    });     
  });   
}); 
