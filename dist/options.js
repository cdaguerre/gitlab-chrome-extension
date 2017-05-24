function restoreOptions() {
  chrome.storage.sync.get({
    url: '',
    token: ''
  }, function(items) {
    document.getElementById('url').value = items.url;
    document.getElementById('token').value = items.token;
  });
}

function saveOptions() {
  var url = document.getElementById('url').value;
  var token = document.getElementById('token').value;
  chrome.storage.sync.set({
    url: url,
    token: token
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
      window.close();
    }, 750);
  });

}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
