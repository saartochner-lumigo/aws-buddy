

const readLocalStorage = async (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], function (result) {
      // if (result[key] === undefined) {
      //   reject();
      // } else {
        resolve(result[key]);
      // }
    });
  });
};

async function getHistoryObjects() {
  return (await readLocalStorage("AWS-HISTORY")) || [];
}

async function saveHistoryObjects(historyObjects) {
    await chrome.storage.local.set({"AWS-HISTORY": historyObjects});
}

async function addHistoryObject(obj) {
  let historyObjects = await getHistoryObjects();
  historyObjects.push(obj);
  await saveHistoryObjects(historyObjects);
}


async function addUrl(url) {
    let historyObjects = await getHistoryObjects();
    let existingObj = historyObjects.find(obj => obj.url === url);
    if (existingObj) {
        existingObj.counter++;
    } else {
        historyObjects.push({name: "temp-name", url, service: "temp-service", counter: 0})
    }
    await saveHistoryObjects(historyObjects);
}

chrome.tabs.onUpdated.addListener(function
  (tabId, changeInfo, tab) {
    // read changeInfo data and do something with it (like read the url)
    if (changeInfo.url) {
      // alert("URL was changed: " + changeInfo.url + "FROM background");
        addUrl(changeInfo.url);
    }
  }
);
