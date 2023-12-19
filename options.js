chrome.storage.local.get(['userEmail'], (result) => {
  if(result.userEmail != undefined && result.userEmail != '') {
    document.getElementById('userEmail').value = result.userEmail;
  }
  document.getElementById('saveSettings').disabled = false;
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
});

function saveSettings() {
  let userEmail = document.getElementById('userEmail').value;

  if (userEmail != '') {
    chrome.storage.local.set({ userEmail: userEmail}, () => {
      document.getElementById('bot-icon').src = 'icons/bot-128.png';
      document.getElementById('status').textContent = 'Settings saved!';
      document.getElementById('status').style = 'color: green;';
    });
  } else {
    document.getElementById('bot-icon').src = 'icons/bot-wrong-128.png';
    document.getElementById('status').textContent = 'Please provide a valid User!';
    document.getElementById('status').style = 'color: red;';
  }
}

