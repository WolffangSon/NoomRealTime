/** API CALLS */

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  switch(request.type) {
    case 'verintRealTimeData':
      verintRealTimeData().then((response) => {
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

function verintRealTimeData() {
  return new Promise((resolve) => {
    let table = [];
    let col = 0;
    let row = 0;
    if(jQuery) {
      jQuery("#oRightPaneContent").contents().find("#adherenceListWrapper .tblItem").each(function(index) {
        if(table[row] == undefined) {
          table[row] = [];
        }

        table[row].push($(this).text());
        col ++;

        if(col > 6) {
          row ++;
          col = 0;
        }
      });
      resolve({
        data: table
      });
    } else {
      resolve({isError: true, error: 'Error: jQuery librafy failed to load!'});
    }
  });
}
