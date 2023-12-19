/** API CALLS */

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  switch(request.type) {
    case 'activate':
      sendResponse({status: 'alive'});
      break;
    case 'accRealTimeData':
      accRealTimeData(request.params.tmsCount).then((response) => {
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

function accRealTimeData(tmsCount) {
  return new Promise((resolve) => {
    let allData = {};
    let parameters = {};

    parameters = getParameters('control-room', tmsCount);
    fetchData(parameters.url, parameters.parameters).then((controlRoom) => {
      allData.controlRoom = controlRoom;
      parameters = getParameters('queues');
      fetchData(parameters.url, parameters.parameters).then((queues) => {
        allData.queues = queues;
        parameters = getParameters('chat-dashboard');
        fetchData(parameters.url, parameters.parameters).then((chatDashboard) => {
          allData.chatDashboard = chatDashboard;
          parameters = getParameters('inbox-tickets-p1');
          fetchData(parameters.url, parameters.parameters).then((ticketsP1) => {
            allData.ticketsP1 = ticketsP1;
            parameters = getParameters('inbox-tickets-p2');
            fetchData(parameters.url, parameters.parameters).then((ticketsP2) => {
              allData.ticketsP2 = ticketsP2;
              parameters = getParameters('inbox-tickets-vip');
              fetchData(parameters.url, parameters.parameters).then((ticketsVIP) => {
                allData.ticketsVIP = ticketsVIP;
                parameters = getParameters('inbox-tickets-pp');
                fetchData(parameters.url, parameters.parameters).then((ticketsPP) => {
                  allData.ticketsPP = ticketsPP;
                  parameters = getParameters('inbox-tickets-pwb');
                  fetchData(parameters.url, parameters.parameters).then((ticketsPwB) => {
                    allData.ticketsPwB = ticketsPwB;
                    resolve({
                      data: allData
                    });
                  });
                });
              });
            })
          })
        });
      });
    });
  });
}

function fetchData(url, parameters) {
  return new Promise((resolve) => {
    if(parameters == undefined || Object.keys(parameters).length == 0) {
      fetch(url,
        {
          headers: {'Content-Type': 'application/json'},
          method: 'GET'
        }
      ).then((response) => {
        if(response.status >= 200 && response.status <= 299) {
          return response.json()
        } else {
          return {isError: true, error: response.statusText}
        }
      }).then((json) => {
        resolve(json);
      });
    } else {
      fetch(url,
      {
        headers: {'Content-Type': 'application/json'},
        method: 'POST',
        body: JSON.stringify(parameters)
      }).then((response) => {
        if (response.status >= 200 && response.status <= 299) {
          return response.json()
        } else {
          return {isError: true, error: response.statusText}
        }
      }).then((json) => {
        resolve(json)
      });
    }
  });
}

function getParameters(type, tmsCount) {
  let parameters = {};
  let url = null;

  switch(type) {
      case 'control-room':
          url = "https://wix.wixanswers.com/api/v1/controlRoom/dashboard";
          parameters = {
              "timeframe": 24,
              "skillIds": [],
              "defaultBusyStatus": false,
              "locationIds": [
                  "c523f7a8-6ef9-4d4e-ba47-949818934474",
                  "6c55b6db-9c81-46f5-a4d8-ad2b51a0ba5d",
                  "f07487b3-904e-440c-89f7-f5852691883e"
              ],
              "statuses": [
                  "10",
                  "60",
                  "40"
              ],
              "sortType": 40,
              "pageSize": tmsCount,
              "page": 1,
              "activeAgents": true
          };
          break;
      case 'queues':
        url = "https://wix.wixanswers.com/api/v1/callcenter/stats/queues";
          break;
      case 'chat-dashboard':
          url = "https://wix.wixanswers.com/api/v1/dashboard/chat/overview";
          parameters = {
            "locales": ["en"],
            "timeframe": 1
          };
          break;
      case 'inbox-tickets-p1':
        url = "https://wix.wixanswers.com/api/v1/tickets/search/admin";
        parameters = {
            "filters": { 
              "channelFilters": 
              [{ "channel": 100, "ids": [] }, 
                { "channel": 110, "ids": [] }, 
                { "channel": 130, "ids": [] }, 
                { "channel": 120, "ids": [] }, 
                { "channel": 122, "ids": [] }, 
                { "channel": 121, "ids": [] }, 
                { "channel": 160, "ids": [] }], 
              "statuses": [100], 
              "priorities": [], 
              "assigned": false, 
              "assignedByUserIds": [], 
              "assignedGroupIds": 
                [
                  "b7f51e46-2240-4de9-aefd-e7e68b5f8ebf", 
                  "cc77a87a-e0fd-4108-99a1-456578cdacc7", 
                  "e72736a0-749d-4224-bd5b-15ce195f36ed", 
                  "d8487716-5ce1-48f9-aa0c-17948ed60364", 
                  "2265ff6b-2ed5-4158-955f-2803c0f1c46d", 
                  "09403685-7a52-48df-8e1d-9151fc0186b8", 
                  "7d2c1305-9108-4c9d-a539-93273b7fc6df", 
                  "a82313b8-232c-453f-b721-2ea08498bf1c", 
                  "a9891f6d-dcfc-4231-9269-f25afa5fdb6e", 
                  "a380246f-d4d9-4180-b073-d2c303eadc03", 
                  "979ac962-55aa-41d2-be65-c069a8e1da77", 
                  "0e58beab-e793-4900-94a8-7957bca36335", 
                  "e9fddbe2-5518-4e99-a6b3-3661b0521b9c", 
                  "006b177d-08bd-4d8e-a68a-8ab4e9e360a7"
                ], 
              "assignedUserIds": [], 
              "ratedUserIds": [], 
              "hasAllOfLabelIds": [], 
              "hasAnyOfLabelIds": [], 
              "notHasAnyOfLabelIds": 
                [
                  "0333e926-94a4-4d4a-8746-40a87f5033d4", 
                  "b0eaa8e8-daab-4d53-a52c-649d00f65aaa", 
                  "ccfa5dbe-e4c6-4b7b-a387-a0009b8b110e", 
                  "a5725335-127f-4e25-ba19-4ad144aa150c", 
                  "e1943447-4a44-4993-8cef-4fd49dac9f60", 
                  "01519096-9442-417d-be38-e329c2cbb66e", 
                  "6edbed29-b58a-406c-b7d5-54f5947c4d24", 
                  "76732062-37d6-4c57-a7ff-c97ff1ee782b", 
                  "0459d4ab-e1c1-48ea-a030-bdfd483b73cc", 
                  "525af36a-ec9f-4473-a399-7af920dbbd74", 
                  "88ba46c4-4613-4e23-88a4-36d9630a6471", 
                  "1bf6fa1d-415d-47f2-9c64-51292d70e65e", 
                  "8b6a5966-7ad9-46b0-864f-025a2d5cbf35", 
                  "e67ce9e2-86c6-49aa-9199-7134ad6a7a69", 
                  "4a4d6fd5-1b23-4a2d-8961-ba434ebe0ef5", 
                  "6a9ab688-cca9-4ed0-ac67-1ef77ddaec61", 
                  "be9bb035-e313-43da-a4e6-ea34f13b4a03", 
                  "ac38d7e7-a117-4926-a7ce-b3e575985d91", 
                  "a5212c73-16ac-4dd8-aca5-f1ee24e11db2", 
                  "dc5c1ea1-e8b2-478e-9b8a-9e29098728b7", 
                  "cc81154a-bca7-4d4c-b066-1d754ce1cfb7", 
                  "e7d2e973-7ccb-4895-9979-04121206b4e8", 
                  "9809a0c4-bf16-49a2-8b8f-de4dd8765b41", 
                  "bb260c7c-6ee4-4cf0-8775-d3573afe70c1", 
                  "7b34c101-d6f2-490e-aeab-03dfe87d4b8d", 
                  "ca0c6fb7-fbec-44af-9738-9b024561f565", 
                  "7358bd77-6cd4-4e22-8b48-36980c997d7f", 
                  "072e1a7a-0152-4cf9-abd3-9ec138350e0b", 
                  "9e0b739b-2e6a-4c00-b7b8-e427d0e9df00", 
                  "306c578e-7038-4884-b554-83d490f4ca54", 
                  "8311ffda-a1f0-4113-8c39-9a767b35024a", 
                  "eb4aec2a-6845-4da6-9715-db89353d31a7", 
                  "18f3f569-37b0-46c6-a8c7-d8e75d7bcd48", 
                  "9d1f12a4-0e67-4f1c-b910-7e5b9e2de701", 
                  "58315d8a-0df3-4aee-b1eb-0219324edd42", 
                  "6e6ff709-6a18-4fbf-a79c-214541c71441"
                ], 
              "spam": false, 
              "relatedArticleIds": [], 
              "countries": [], 
              "customFieldFilters": {}, 
              "snooze": { "filterType": 3 }, 
              "timeZone": "America/Guatemala", 
              "assignedToMe": null, 
              "assignedToMyGroups": null, 
              "assignedToAnyAgent": null 
            }, 
            "secondarySortType": 50, 
            "locale": "en", 
            "text": "", 
            "pageSize": 50, 
            "resolveCompanyCustomFields": true, 
            "resolveTicketUserCustomFields": true, 
            "page": 1, 
            "sortType": 160 
          };
          break;
        case 'inbox-tickets-p2':
          url = "https://wix.wixanswers.com/api/v1/tickets/search/admin";
          parameters = {
          "filters": {
            "channelFilters": [
              {"channel": 100, "ids": []},
              {"channel": 110, "ids": []},
              {"channel": 130, "ids": []},
              {"channel": 120, "ids": []},
              {"channel": 122, "ids": []},
              {"channel": 121, "ids": []},
              {"channel": 160, "ids": []}
            ],
            "statuses": [100],
            "priorities": [],
            "assignedByUserIds": [],
            "assignedGroupIds": [
              "a753a9ab-e5f3-4a6f-abb4-7d55a7d3cc02",
              "81ec4447-1487-4dac-9f37-08852a9dc317",
              "0f91ce8d-c4fe-4aa2-909c-2fc2fd6bf0cf",
              "4ecf3c95-115e-4e78-ab4c-0cd0113d79fa",
              "3eef8623-24cf-4175-b55d-895277d1f82d",
              "baad3f6e-c656-48bc-b2c5-f78d73e0c63d",
              "4c7ee1a2-613e-4a0d-9819-78fd1c7aa7c4",
              "3a2eb459-83b2-4038-b6fb-dce5206ac111",
              "3671da8b-0803-4424-80fb-511988154eef",
              "994b65c2-cc9e-4166-af54-abbd267799c6",
              "6a3bcb9a-6d55-404f-83a0-62fb815fd7c8",
              "c338b077-ca4f-4cb2-96fb-5564ce200f0f",
              "28eba8de-4093-4791-8792-8557d7a100af",
              "ad656b2f-1ca4-4ab5-8540-55f5f0482825",
              "2784b401-138a-4ed5-8eb3-275f2ad36b84"
            ],
            "assignedUserIds": [],
            "ratedUserIds": [],
            "hasAllOfLabelIds": [],
            "hasAnyOfLabelIds": [],
            "notHasAnyOfLabelIds": [
              "0333e926-94a4-4d4a-8746-40a87f5033d4",
              "ccfa5dbe-e4c6-4b7b-a387-a0009b8b110e",
              "a5725335-127f-4e25-ba19-4ad144aa150c",
              "e1943447-4a44-4993-8cef-4fd49dac9f60",
              "01519096-9442-417d-be38-e329c2cbb66e",
              "6edbed29-b58a-406c-b7d5-54f5947c4d24",
              "76732062-37d6-4c57-a7ff-c97ff1ee782b",
              "0459d4ab-e1c1-48ea-a030-bdfd483b73cc",
              "525af36a-ec9f-4473-a399-7af920dbbd74",
              "88ba46c4-4613-4e23-88a4-36d9630a6471",
              "1bf6fa1d-415d-47f2-9c64-51292d70e65e",
              "8b6a5966-7ad9-46b0-864f-025a2d5cbf35",
              "e67ce9e2-86c6-49aa-9199-7134ad6a7a69",
              "4a4d6fd5-1b23-4a2d-8961-ba434ebe0ef5",
              "6a9ab688-cca9-4ed0-ac67-1ef77ddaec61",
              "be9bb035-e313-43da-a4e6-ea34f13b4a03",
              "a5212c73-16ac-4dd8-aca5-f1ee24e11db2",
              "e7d2e973-7ccb-4895-9979-04121206b4e8",
              "ca0c6fb7-fbec-44af-9738-9b024561f565",
              "7358bd77-6cd4-4e22-8b48-36980c997d7f",
              "072e1a7a-0152-4cf9-abd3-9ec138350e0b",
              "9e0b739b-2e6a-4c00-b7b8-e427d0e9df00",
              "306c578e-7038-4884-b554-83d490f4ca54",
              "8311ffda-a1f0-4113-8c39-9a767b35024a",
              "eb4aec2a-6845-4da6-9715-db89353d31a7",
              "18f3f569-37b0-46c6-a8c7-d8e75d7bcd48",
              "9d1f12a4-0e67-4f1c-b910-7e5b9e2de701",
              "58315d8a-0df3-4aee-b1eb-0219324edd42",
              "6e6ff709-6a18-4fbf-a79c-214541c71441",
              "029340ca-d923-47c5-b203-3b284481a258"
            ],
            "spam": false,
            "relatedArticleIds": [],
            "countries": [],
            "customFieldFilters": {},
            "snooze": {
              "filterType": 3
            },
            "timeZone": "America/Guatemala",
            "assignedToAnyAgent": null,
            "assignedToMe": null,
            "assignedToMyGroups": null
          },
          "secondarySortType": 50,
          "locale": "en",
          "text": "",
          "pageSize": 50,
          "resolveCompanyCustomFields": true,
          "resolveTicketUserCustomFields": true,
          "page": 1,
          "sortType": 160
        };
        break;
      case 'inbox-tickets-vip':
        url = "https://wix.wixanswers.com/api/v1/tickets/search/admin";
        parameters = {
          "filters": {
            "channelFilters": [
              {"channel": 100, "ids": []},
              {"channel": 110, "ids": []},
              {"channel": 120, "ids": []},
              {"channel": 122, "ids": []},
              {"channel": 121, "ids": []},
              {"channel": 130, "ids": []},
              {"channel": 160, "ids": []}
            ],
            "statuses": [100],
            "priorities": [],
            "assigned": false,
            "assignedByUserIds": [],
            "assignedGroupIds": [
              "006b177d-08bd-4d8e-a68a-8ab4e9e360a7",
              "09403685-7a52-48df-8e1d-9151fc0186b8",
              "0e58beab-e793-4900-94a8-7957bca36335",
              "2265ff6b-2ed5-4158-955f-2803c0f1c46d",
              "3eea0f54-720d-47d8-a6d9-ca85224ff63f",
              "6f5483b0-6189-4a0d-bbfe-281c60086311",
              "7d2c1305-9108-4c9d-a539-93273b7fc6df",
              "81ec4447-1487-4dac-9f37-08852a9dc317",
              "994b65c2-cc9e-4166-af54-abbd267799c6",
              "ad58feaf-564b-4f42-a8c3-305c1b915a11",
              "ad656b2f-1ca4-4ab5-8540-55f5f0482825",
              "c338b077-ca4f-4cb2-96fb-5564ce200f0f",
              "e72736a0-749d-4224-bd5b-15ce195f36ed",
              "ef67fe0d-a18b-4ce4-8512-7b374604e481",
              "f649604d-bae3-4a2e-8acc-8e0d0c56c176",
              "fb16cb21-d58d-4154-ba15-fa9a8e4587c4",
              "eb199035-8f57-479f-953d-0e0bc5765c0e",
              "ffbca33e-60dc-42d5-b4fb-91434db81179",
              "cc77a87a-e0fd-4108-99a1-456578cdacc7",
              "5a110f6f-2ca7-4c0e-86b5-752ba0ea3d2b",
              "a380246f-d4d9-4180-b073-d2c303eadc03",
              "3eef8623-24cf-4175-b55d-895277d1f82d",
              "f7575e67-45a3-4ad3-a869-ba4b804419ed",
              "b7f51e46-2240-4de9-aefd-e7e68b5f8ebf",
              "7b911b3e-9cd2-49f4-bb11-19ad6ead0697",
              "c8b41bca-e777-4998-babf-800b21e9163b",
              "7e68ebae-a8c9-4c57-bcf6-d9e0310d1020",
              "5a983161-ed0c-4ed3-a346-a85711b7b10e",
              "298561b0-d9b5-4c71-b6aa-a7a958467717",
              "a753a9ab-e5f3-4a6f-abb4-7d55a7d3cc02",
              "3a2eb459-83b2-4038-b6fb-dce5206ac111",
              "3671da8b-0803-4424-80fb-511988154eef",
              "2ee465a2-5622-4b4c-8167-5b9e27d19076",
              "baad3f6e-c656-48bc-b2c5-f78d73e0c63d",
              "d8487716-5ce1-48f9-aa0c-17948ed60364",
              "a9891f6d-dcfc-4231-9269-f25afa5fdb6e",
              "d21b88bb-6572-4289-a996-d687af101f31",
              "331ec755-2e0c-4af5-84b9-534701c27ea6",
              "510d1df6-0e22-4858-b83c-0b9aea347069",
              "1783e38b-447a-4262-9320-b4f0f382b4fc",
              "050eff0f-c4b5-410d-80c0-5bd7318ee791",
              "979ac962-55aa-41d2-be65-c069a8e1da77",
              "a82313b8-232c-453f-b721-2ea08498bf1c",
              "4c7ee1a2-613e-4a0d-9819-78fd1c7aa7c4"
            ],
            "assignedUserIds": [],
            "repliedByUserIds": [],
            "ratedUserIds": [],
            "hasAllOfLabelIds": [],
            "hasAnyOfLabelIds": [
              "0333e926-94a4-4d4a-8746-40a87f5033d4",
              "ccfa5dbe-e4c6-4b7b-a387-a0009b8b110e",
              "a5725335-127f-4e25-ba19-4ad144aa150c",
              "e1943447-4a44-4993-8cef-4fd49dac9f60",
              "01519096-9442-417d-be38-e329c2cbb66e",
              "6edbed29-b58a-406c-b7d5-54f5947c4d24",
              "76732062-37d6-4c57-a7ff-c97ff1ee782b",
              "0459d4ab-e1c1-48ea-a030-bdfd483b73cc",
              "525af36a-ec9f-4473-a399-7af920dbbd74",
              "88ba46c4-4613-4e23-88a4-36d9630a6471",
              "1bf6fa1d-415d-47f2-9c64-51292d70e65e",
              "8b6a5966-7ad9-46b0-864f-025a2d5cbf35",
              "e67ce9e2-86c6-49aa-9199-7134ad6a7a69",
              "4a4d6fd5-1b23-4a2d-8961-ba434ebe0ef5",
              "6a9ab688-cca9-4ed0-ac67-1ef77ddaec61",
              "be9bb035-e313-43da-a4e6-ea34f13b4a03",
              "ac38d7e7-a117-4926-a7ce-b3e575985d91",
              "a5212c73-16ac-4dd8-aca5-f1ee24e11db2",
              "dc5c1ea1-e8b2-478e-9b8a-9e29098728b7",
              "cc81154a-bca7-4d4c-b066-1d754ce1cfb7",
              "e7d2e973-7ccb-4895-9979-04121206b4e8",
              "ca0c6fb7-fbec-44af-9738-9b024561f565",
              "485294ed-8573-4947-bf51-a0fc98e4931a"
            ],
            "notHasAnyOfLabelIds": [
              "4396141f-119d-4cf2-acec-945cdd327608",
              "e90ea384-3954-463a-b6d9-640d8d4c637f",
              "7e852000-2ebb-4c17-849f-862171c39e00",
              "7358bd77-6cd4-4e22-8b48-36980c997d7f",
              "bfe01722-29be-4943-a91e-33813783d21a",
              "a08344ea-daf6-4e2d-a9f5-eaedda1977a9",
              "072e1a7a-0152-4cf9-abd3-9ec138350e0b",
              "306c578e-7038-4884-b554-83d490f4ca54",
              "eb4aec2a-6845-4da6-9715-db89353d31a7",
              "58315d8a-0df3-4aee-b1eb-0219324edd42",
              "0cc34b80-3ecc-4426-9b1d-bce2f50de63b",
              "b2310285-bde9-47d5-b301-97f544478830",
              "ba75e613-90d5-45a6-a845-af7fc91094bb",
              "caebdd1a-ef32-4277-9699-3aa722b0d008",
              "708152e3-2c11-409b-9435-8a3980742efe",
              "0034f5d5-5826-408e-90fb-8986ecad2b18",
              "1e390dbb-17e4-4677-8d8c-3ad14112a737",
              "c3c896bd-f85d-4ed6-a1b1-c45fc28d242e",
              "f25613c0-da9a-4d67-9a64-ee88dddb3711"
            ],
            "spam": false,
            "relatedArticleIds": [],
            "countries": [],
            "customFieldFilters": {},
            "timeZone": "America/Guatemala",
            "assignedToAnyAgent": null
          },
          "locale": "en",
          "text": "",
          "pageSize": 50,
          "resolveCompanyCustomFields": true,
          "resolveTicketUserCustomFields": true,
          "page": 1,
          "sortType": 150
        };
        break;
      case 'inbox-tickets-pp':
        url = "https://wix.wixanswers.com/api/v1/tickets/search/admin";
        parameters = {
          "filters": {
            "channelFilters": [
              {"channel": 100, "ids": []},
              {"channel": 110, "ids": []},
              {"channel": 130, "ids": []},
              {"channel": 120, "ids": []},
              {"channel": 122, "ids": []},
              {"channel": 121, "ids": []}
            ],
            "statuses": [100],
            "priorities": [],
            "assigned": false,
            "assignedByUserIds": [],
            "assignedGroupIds": [
              "0b44ab9d-9d1e-418b-a6a6-8c64f840c7bc",
              "1c870de6-bbd9-4e47-8cb8-45ca3d6857b1",
              "dfb35ab1-9f1a-49f5-bef3-bb050c86c862",
              "5ae2b0f9-cad4-430d-a96a-f84578a99a35"
            ],
            "assignedUserIds": [],
            "ratedUserIds": [],
            "hasAllOfLabelIds": [],
            "hasAnyOfLabelIds": [],
            "notHasAnyOfLabelIds": [
              "0333e926-94a4-4d4a-8746-40a87f5033d4",
              "b0eaa8e8-daab-4d53-a52c-649d00f65aaa",
              "ccfa5dbe-e4c6-4b7b-a387-a0009b8b110e",
              "a5725335-127f-4e25-ba19-4ad144aa150c",
              "e1943447-4a44-4993-8cef-4fd49dac9f60",
              "01519096-9442-417d-be38-e329c2cbb66e",
              "6edbed29-b58a-406c-b7d5-54f5947c4d24",
              "76732062-37d6-4c57-a7ff-c97ff1ee782b",
              "0459d4ab-e1c1-48ea-a030-bdfd483b73cc",
              "525af36a-ec9f-4473-a399-7af920dbbd74",
              "88ba46c4-4613-4e23-88a4-36d9630a6471",
              "1bf6fa1d-415d-47f2-9c64-51292d70e65e",
              "8b6a5966-7ad9-46b0-864f-025a2d5cbf35",
              "e67ce9e2-86c6-49aa-9199-7134ad6a7a69",
              "4a4d6fd5-1b23-4a2d-8961-ba434ebe0ef5",
              "6a9ab688-cca9-4ed0-ac67-1ef77ddaec61",
              "be9bb035-e313-43da-a4e6-ea34f13b4a03",
              "ac38d7e7-a117-4926-a7ce-b3e575985d91",
              "a5212c73-16ac-4dd8-aca5-f1ee24e11db2",
              "dc5c1ea1-e8b2-478e-9b8a-9e29098728b7",
              "cc81154a-bca7-4d4c-b066-1d754ce1cfb7",
              "e7d2e973-7ccb-4895-9979-04121206b4e8",
              "9809a0c4-bf16-49a2-8b8f-de4dd8765b41",
              "bb260c7c-6ee4-4cf0-8775-d3573afe70c1",
              "7b34c101-d6f2-490e-aeab-03dfe87d4b8d",
              "ca0c6fb7-fbec-44af-9738-9b024561f565",
              "7358bd77-6cd4-4e22-8b48-36980c997d7f",
              "072e1a7a-0152-4cf9-abd3-9ec138350e0b",
              "9e0b739b-2e6a-4c00-b7b8-e427d0e9df00",
              "306c578e-7038-4884-b554-83d490f4ca54",
              "8311ffda-a1f0-4113-8c39-9a767b35024a",
              "eb4aec2a-6845-4da6-9715-db89353d31a7",
              "18f3f569-37b0-46c6-a8c7-d8e75d7bcd48",
              "9d1f12a4-0e67-4f1c-b910-7e5b9e2de701",
              "58315d8a-0df3-4aee-b1eb-0219324edd42",
              "6e6ff709-6a18-4fbf-a79c-214541c71441"
            ],
            "spam": false,
            "relatedArticleIds": [],
            "countries": [],
            "customFieldFilters": {},
            "timeZone": "America/Guatemala",
            "assignedToAnyAgent": null
          },
          "secondarySortType": 50,
          "locale": "en",
          "text": "",
          "pageSize": 30,
          "resolveCompanyCustomFields": true,
          "resolveTicketUserCustomFields": true,
          "page": 1,
          "sortType": 160
        };
        break;
      case 'inbox-tickets-pwb':
        url = "https://wix.wixanswers.com/api/v1/tickets/search/admin";
        parameters = {
          "filters": {
            "channelFilters": [
              {"channel": 100, "ids": []},
              {"channel": 110, "ids": []},
              {"channel": 130, "ids": []},
              {"channel": 120, "ids": []},
              {"channel": 122, "ids": []},
              {"channel": 121, "ids": []}
            ],
            "statuses": [100],
            "priorities": [],
            "assigned": false,
            "assignedByUserIds": [],
            "assignedGroupIds": [
              "d4e047cc-ba40-4316-a3ef-f9988fd8eccb",
              "3b58611c-ea69-4904-b3e6-519a3c011d29"
            ],
            "assignedUserIds": [],
            "ratedUserIds": [],
            "hasAllOfLabelIds": [],
            "hasAnyOfLabelIds": [],
            "notHasAnyOfLabelIds": [
              "0333e926-94a4-4d4a-8746-40a87f5033d4",
              "b0eaa8e8-daab-4d53-a52c-649d00f65aaa",
              "ccfa5dbe-e4c6-4b7b-a387-a0009b8b110e",
              "a5725335-127f-4e25-ba19-4ad144aa150c",
              "e1943447-4a44-4993-8cef-4fd49dac9f60",
              "01519096-9442-417d-be38-e329c2cbb66e",
              "6edbed29-b58a-406c-b7d5-54f5947c4d24",
              "76732062-37d6-4c57-a7ff-c97ff1ee782b",
              "0459d4ab-e1c1-48ea-a030-bdfd483b73cc",
              "525af36a-ec9f-4473-a399-7af920dbbd74",
              "88ba46c4-4613-4e23-88a4-36d9630a6471",
              "1bf6fa1d-415d-47f2-9c64-51292d70e65e",
              "8b6a5966-7ad9-46b0-864f-025a2d5cbf35",
              "e67ce9e2-86c6-49aa-9199-7134ad6a7a69",
              "4a4d6fd5-1b23-4a2d-8961-ba434ebe0ef5",
              "6a9ab688-cca9-4ed0-ac67-1ef77ddaec61",
              "be9bb035-e313-43da-a4e6-ea34f13b4a03",
              "ac38d7e7-a117-4926-a7ce-b3e575985d91",
              "a5212c73-16ac-4dd8-aca5-f1ee24e11db2",
              "dc5c1ea1-e8b2-478e-9b8a-9e29098728b7",
              "cc81154a-bca7-4d4c-b066-1d754ce1cfb7",
              "e7d2e973-7ccb-4895-9979-04121206b4e8",
              "9809a0c4-bf16-49a2-8b8f-de4dd8765b41",
              "bb260c7c-6ee4-4cf0-8775-d3573afe70c1",
              "7b34c101-d6f2-490e-aeab-03dfe87d4b8d",
              "ca0c6fb7-fbec-44af-9738-9b024561f565",
              "7358bd77-6cd4-4e22-8b48-36980c997d7f",
              "072e1a7a-0152-4cf9-abd3-9ec138350e0b",
              "9e0b739b-2e6a-4c00-b7b8-e427d0e9df00",
              "306c578e-7038-4884-b554-83d490f4ca54",
              "8311ffda-a1f0-4113-8c39-9a767b35024a",
              "eb4aec2a-6845-4da6-9715-db89353d31a7",
              "18f3f569-37b0-46c6-a8c7-d8e75d7bcd48",
              "9d1f12a4-0e67-4f1c-b910-7e5b9e2de701",
              "58315d8a-0df3-4aee-b1eb-0219324edd42",
              "6e6ff709-6a18-4fbf-a79c-214541c71441"
            ],
            "spam": false,
            "relatedArticleIds": [],
            "countries": [],
            "customFieldFilters": {},
            "timeZone": "America/Guatemala",
            "assignedToAnyAgent": null,
            "assignedToMe": null,
            "assignedToMyGroups": null
          },
          "secondarySortType": 50,
          "locale": "en",
          "text": "",
          "pageSize": 30,
          "resolveCompanyCustomFields": true,
          "resolveTicketUserCustomFields": true,
          "page": 1,
          "sortType": 160
        };
        break;
  }

  return {url: url, parameters: parameters};
}