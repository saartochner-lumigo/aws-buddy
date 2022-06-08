

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

function urlToHistoryObject(url) {
    const region = url.split("//")[1].split(".")[0]
    const commonObj = {counter: 1, region}
    if (!url.includes("console.aws.amazon.com")) {
        return null
    }
    if (url.includes("console.aws.amazon.com/lambda/") && url.includes("/functions/")) {
        let name = url.split("/")[url.split("/").length - 1];
        if (name.includes("?")) {
            const cleanName = name.substr(0, name.indexOf("?"));
            url = url.replace(name, cleanName);
            name = cleanName;
        }
        return {name, url, service: "lambda-function", ...commonObj}
    }
}

async function addUrl(url) {
    let historyObjects = await getHistoryObjects();
    const historyObj = urlToHistoryObject(url)
    let existingObj = historyObjects.find(obj => obj.url === historyObj.url);
    if (existingObj) {
        existingObj.counter++;
        await saveHistoryObjects(historyObjects);
        return;
    }
    if (historyObj) {
        historyObjects.push(historyObj);
        await saveHistoryObjects(historyObjects);
    }
}

chrome.tabs.onUpdated.addListener(async function
  (tabId, changeInfo, tab) {
    // read changeInfo data and do something with it (like read the url)
    if (changeInfo.url) {
      // alert("URL was changed: " + changeInfo.url + "FROM background");
        await addUrl(changeInfo.url);
    }
  }
);
