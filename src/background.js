

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

async function addHistoryObject(obj) {
  let historyObjects = await getHistoryObjects();
  historyObjects.push(obj);
  await chrome.storage.local.set({"AWS-HISTORY": historyObjects});
}

chrome.tabs.onUpdated.addListener(function
  (tabId, changeInfo, tab) {
    // read changeInfo data and do something with it (like read the url)
    if (changeInfo.url) {
      // alert("URL was changed: " + changeInfo.url + "FROM background");
        addHistoryObject(changeInfo.url);
    }
  }
);
