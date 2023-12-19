/** API CALLS */

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  switch(request.type) {
    case 'gttLogin':
      gttLogin(request.params.gttToken).then((json) => {
        if(json.isError) {
          sendResponse({status: 'error', error: json.error});
        } else {
          sendResponse({status: 'success', data: json});
        }
      });
      break;
    case 'gttRealTimeData':
      gttRealTimeData(request.params.atlasToken, request.params.krakenToken).then((response) => {
        if(response.isError) {
          sendResponse({status: 'error', error: response.error});
        } else {
          sendResponse({status: 'success', data: response});
        }
      });
      break;
    default:
      sendResponse({status: 'error', isError: true, error: 'No message type specified.'});
  }
  return true;
});

/** CUSTOM FUNCTIONS */
function gttLogin(gttToken) {
  return new Promise((resolve) => {
    fetch("https://ti-is-apigw.telusinternational.com/admin/api/login", {
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({data: gttToken}),
      method: 'POST',
    }).then((response) => {
      if(response.status >= 200 && response.status <= 299) {
        return response.json()
      } else {
        return {isError: true, error: response.statusText}
      }
    }).then((json) => {
      if(json.isError) {
        resolve(json);
      } else {
        resolve({
          krakenToken: json.data.krakenToken, 
          atlasToken: json.data.session
        });
      }
    });
  })
}

function gttRealTimeData(atlasToken, krakenToken) {
  return new Promise((resolve) => {
    fetch("https://ti-is-apigw.telusinternational.com/tracker/api/employee", {
      headers: {
        'Content-Type': 'application/json',
        'authorization': 'Bearer ' + krakenToken
      },
      body: JSON.stringify({
        "arrFa": [{
          "functionalAreaId": "FA_Wix",
          "site": ""
        }],
        "krakenToken": krakenToken,
        "atlasToken": atlasToken,
      }),
      method: 'POST'
    }).then((response) => {
      if(response.status >= 200 && response.status <= 299) {
        return response.json()
      } else {
        return {isError: true, error: response.statusText}
      }
    }).then((json) => {
      resolve(json);
    });
  });
}
