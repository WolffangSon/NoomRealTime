/** SETTING UP CONSTANTS */
const ACCOUNTNAME = 'Wix';
const APPNAME1 = 'ACC';
const APPNAME2 = 'GTT';
const APPNAME3 = 'Verint';
const REFRESHMINS = 1;
const WEBAPPURLACC = 'https://script.google.com/a/macros/telusinternational.com/s/AKfycbxwBsqFG4CoIiFpINCu_JzehTMRPHrfBKVROUZG8N5CP90LyLUgpy1ZfdBaALgsQx8qWA/exec'; // Optional y no webapp url on Settings Page.
const WEBAPPURLGTT = 'https://script.google.com/a/macros/telusinternational.com/s/AKfycbwrMUDW896f3-BHWvz9rx5LZHJVU4HdaxLzHFGM7vR9BlaM5L7RJQh8Y34xpXIF1tdMAQ/exec';

/** API CALLS **/

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['userEmail', 'tmsCount', 'gttToken']).then((result) => {
    if(result.userEmail == undefined || result.tmsCount == undefined || result.gttToken == undefined) {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        chrome.tabs.create({active: true, url: 'options.html'});
      }
    }
  });

  chrome.storage.local.set({botActive: 0, atlasToken: null, krakenToken: null});
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['botActive']).then((storage) => {
    if(storage.botActive == 1) {
      chrome.storage.local.set({botActive: 0, atlasToken: null, krakenToken: null}).then(() => {
        botUnsetAlarm('accRealTimeData');
        botUnsetAlarm('gttRealTimeData');
        botUnsetAlarm('gttLogin');
        botUnsetAlarm('verintRealTimeData');
      });
    }
  });
});

chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.get(['tmsCount', 'gttToken', 'botActive']).then((storage) => {
    if(storage.botActive == 0) {
      if(storage.gttToken == undefined || storage.gttToken == '') {
        botNotifSend(
          'warning',
          ACCOUNTNAME + ' Bot Error!',
          'Missing GTT Token, please go to settings page to fix it.'
          );
      } else {
        chrome.tabs.sendMessage(tab.id, {type: 'activate'}).catch((error1) => {
          return {isError: true, error: error1}
        }).then((response1) => {
          if(response1.isError) {
            botNotifSend(
              'warning',
              ACCOUNTNAME + ' Bot Error!',
              'Please make sure you have ' + APPNAME1 + ' open or reload the page and try again.'
            );
          } else {
            chrome.storage.local.set({accTabId: tab.id}).then(() => {
              chrome.tabs.create({active: false, url: 'https://gtt.telusinternational.com'}).then((gttTab) => {
                chrome.storage.local.set({gttTabId: gttTab.id});
              });
              chrome.tabs.create({active: true, url: 'https://portal.wfo.telusinternational.com/wfo/control/timerecord_quickview_fs?NEWUINAV=1'}).then((verintTab) => {
                chrome.storage.local.set({verintTabId: verintTab.id});
              });
            });
            botActivate(tab.id, storage.tmsCount, storage.gttToken);
          }
        });
      }
    } else {
      botDeactivate();
    }
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.storage.local.get(['botActive']).then((result) => {
    if(result.botActive == 1) {
      switch(alarm.name) {
        case 'accRealTimeData':
          chrome.storage.local.get(['accTabId', 'tmsCount']).then((storage) => {
            botGetPostData(alarm.name, storage.accTabId, WEBAPPURLACC, {
              tmsCount: storage.tmsCount, 
              dataType: 'acc'
            });
          });
          break;
        case 'gttRealTimeData':
          chrome.storage.local.get(['gttTabId', 'atlasToken', 'krakenToken']).then((storage) => {
            botGetPostData(alarm.name, storage.gttTabId, WEBAPPURLGTT, {
              atlasToken: storage.atlasToken, 
              krakenToken: storage.krakenToken,
              dataType: 'gtt'
            });
          });
          break;
        case 'gttLogin':
          chrome.storage.local.get(['gttTabId', 'gttToken']).then((storage) => {
            chrome.tabs.sendMessage(storage.tabId, {type: alarm.name, params: {gttToken: storage.gttToken}}).catch((error) => {
              return {isError: true, error: error}
            }).then((response) => {
              if(response.isError) {
                botNotifSend(
                  'warning',
                  ACCOUNTNAME + ' Bot Error!',
                  'Please make sure you have ' + APPNAME2 + ' open or reload the page and try again.'
                );
              } else {
                if(response.status == 'error') {
                  botNotifSend(
                    'warning',
                    ACCOUNTNAME + ' Bot Error!',
                    APPNAME2 + ' unable get the data, please check your token.'
                  );
                } else {
                  chrome.storage.local.set({atlasToken: response.data.atlasToken, krakenToken: response.data.krakenToken});
                }
              }
            });
          });
          break;
          case 'verintRealTimeData':
            chrome.storage.local.get(['verintTabId']).then((storage) => {
              botGetPostData(alarm.name, storage.verintTabId, WEBAPPURLGTT, {
                dataType: 'verint'
              });
            });
            break;
        default:
          console.log('No alarm name defined. Nothing to do.')
      }
    } else {
      console.log("Bot Inactive, nothing to do.")
    }
  });
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {

});


/** CUSTOM FUNCTIONS */

function botActivate(accTabId, tmsCount, gttToken) {

  botGetPostData('accRealTimeData', accTabId, WEBAPPURLACC, {tmsCount: tmsCount, dataType: 'acc'}).then((response) => {
    if(response.isError == false) {
      chrome.storage.local.get(['gttTabId', 'verintTabId']).then((storage) => {
        chrome.tabs.sendMessage(storage.gttTabId, {type: 'gttLogin', params: {gttToken: gttToken}}).catch((error) => {
          return {isError: true, error: error}
        }).then((response) => {
          if(response.isError) {
            botNotifSend(
              'warning',
              ACCOUNTNAME + ' Bot Error!',
              'Please make sure you have ' + APPNAME2 + ' open or reload the page and try again.'
            );
          } else {
            if(response.status == 'error') {
              botNotifSend(
                'warning',
                ACCOUNTNAME + ' Bot Error!',
                APPNAME2 + ' unable to get the data, please check your token.'
              );
            } else {
              chrome.storage.local.set({atlasToken: response.data.atlasToken, krakenToken: response.data.krakenToken}).then(() => {
                botGetPostData('gttRealTimeData', storage.gttTabId, WEBAPPURLGTT, {atlasToken: response.data.atlasToken, krakenToken: response.data.krakenToken, dataType: 'gtt'});
                botGetPostData('verintRealTimeData', storage.verintTabId, WEBAPPURLGTT, {dataType: 'verint'});
                chrome.storage.local.set({botActive: 1}).then(() => {
                  botSetAlarm('accRealTimeData', REFRESHMINS);
                  botSetAlarm('gttRealTimeData', REFRESHMINS);
                  botSetAlarm('verintRealTimeData', REFRESHMINS);
                  botSetAlarm('gttLogin', 120); // Refresh Credentials every 2 hours.
                  botSetIcon('activated', 'RTU Bot (Active)', {text: `${REFRESHMINS}`, color: 'green'});
                  botNotifSend(
                    'activated',
                    ACCOUNTNAME + ' Bot is active!',
                    `${APPNAME1}, ${APPNAME2}, ${APPNAME3} are updating every ${REFRESHMINS} minutes.`
                  );
                });
              });
            }
          }
        });
      });
    }
  });
}

function botDeactivate() {
  chrome.storage.local.set({botActive: 0}).then(() => {
    chrome.storage.local.get(['gttTabId', 'verintTabId']).then((storage) => {
      chrome.tabs.remove([storage.gttTabId, storage.verintTabId]);
    });
    botUnsetAlarm('accRealTimeData');
    botUnsetAlarm('gttRealTimeData');
    botUnsetAlarm('gttLogin');
    botUnsetAlarm('verintRealTimeData');
    botSetIcon('deactivated', 'RTU Bot (Inactive)', {text: ''});
    botNotifSend(
      'deactivated',
      'RTU Bot Deactivated!',
      'No more updates.'
    );
  });
}

function botSetAlarm(name, minutes) {
  chrome.alarms.create(name, { periodInMinutes: minutes });
}

function botUnsetAlarm(name) {
  chrome.alarms.clear(name, (wasCleared) => {
    if(wasCleared != true) {
      console.log('RTU Bot Error: There was an issue unsetting the alarm: ' + name);
    }
  });
}

function botPostData(url, data) {
  return new Promise((resolve) => {
    fetch(url, {
      headers: {'Content-Type': 'text/plain'},
      method: 'POST',
      body: JSON.stringify(data)
    }).then((response) => {
      if(response.status >= 200 && response.status <= 299) {
        return response.text()
      } else {
        return JSON.stringify({isError: true, error: response.statusText})
      }
    }).then((text) => {
      try {
        resolve(JSON.parse(text));
      } catch(error) {
        resolve({isError: true, error: error});
      }
    });
  });
}

function botGetPostData(type, tabId, url, params) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, {type: type, params: params}).catch((error) => {
      return {isError: true, error: error}
    }).then((response) => {
      if(response.isError) {
        botNotifSend(
          'warning',
          ACCOUNTNAME + ' Bot Error!',
          'Please make sure you have ' + APPNAME1 + ' open or reload the page.'
        );
        resolve({isError: true});
      } else {
        if(response.status == 'error') {
          botNotifSend(
            'warning',
            ACCOUNTNAME + ' Bot Error!',
            APPNAME + ' unable get the data, please check your token.'
          );
          resolve({isError: true});
        } else {
          chrome.storage.local.get(['userEmail']).then((storage) => {  
          // Add extra data to the response.
            response.data.userEmail = storage.userEmail;
            response.data.refreshInt = REFRESHMINS;
            response.data.dataType = params.dataType;
            botPostData(url, response.data).then((result) => {
              if(result.isError) {
                chrome.storage.local.get(['errorCounter']).then((storage) => {
                  botErrorCounter(storage.errorCounter, {
                    title: result.error.name, 
                    message: result.error.message
                  });
                  resolve({isError: true});
                });
              } else {
                if(result.status == 1) {
                  chrome.storage.local.set({errorCounter: 0});
                  resolve({isError: false});
                } else if(result.status == 2) {
                  chrome.storage.local.get(['errorCounter']).then((storage) => {
                    botErrorCounter(storage.errorCounter, {
                      title: ACCOUNTNAME + ' Bot Error!',
                      message: 'Another bot is running: ' + result.userEmail
                    });
                    resolve({isError: true});
                  });
                } else {
                  chrome.storage.local.get(['errorCounter']).then((storage) => {
                    botErrorCounter(storage.errorCounter, {
                      title: ACCOUNTNAME + ' Bot Error!', 
                      message: 'There was an issue posting the data.'
                    });
                    resolve({isError: true});
                  });
                }
              }
            });
          });
        }
      }
    });
  });
}

function botErrorCounter(errorCounter, errorMessage) {
  if(errorCounter > 4) {
    botNotifSend(
      'warning',
      ACCOUNTNAME + ' Bot Error!',
      `Deactivating ` + ACCOUNTNAME + `RTU Bot due to ${errorCounter} consecutive failures.`
      );
    botDeactivate();
    chrome.storage.local.set({errorCounter: 0});
  } else {
    botNotifSend(
      'warning',
      errorMessage.title,
      errorMessage.message
    );
    chrome.storage.local.set({errorCounter: errorCounter + 1});
  }
}

function botNotifSend(type, title, message) {
  
  let icon = '';
  switch(type) {
    case 'activated':
      icon = 'icons/bot-64.png';
      break;
    case 'deactivated':
      icon = 'icons/bot-inactive-64.png';
      break;
    case 'warning':
      icon = 'icons/bot-warning-64.png';
      break;
    default:
      icon = 'icons/bot-64.png';
  }
  chrome.notifications.create({
    type: 'basic',
    iconUrl: icon,
    title: title,
    message: message
  });

}

function botSetIcon(type, title, badge) {

  let icon = '';
  switch(type) {
    case 'activated':
      icon = 'icons/bot-16.png';
      break;
    case 'deactivated':
      icon = 'icons/bot-inactive-16.png';
      break;
    case 'warning':
      icon = 'icons/bot-warning-16.png';
      break;
    default:
      icon = 'icons/bot-16.png';
  }
  chrome.action.setIcon({ path: {'16': icon} });
  if(title) {
    chrome.action.setTitle({ title: title });
  }
  if(badge) {
    chrome.action.setBadgeText({ text: badge.text });
    if(badge.color) {
      chrome.action.setBadgeBackgroundColor({ color: badge.color });
    }
  }

}
