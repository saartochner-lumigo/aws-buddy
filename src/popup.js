function getCurrentTab() {
  if (window.chrome) {
    return new Promise((resolve) => {
      chrome.tabs.query({ currentWindow:true, active:true }, tabs => {
        resolve(tabs[0])
      })
    })
  } else if (window.browser) {
    return browser.tabs.query({ currentWindow:true, active:true }).then(tabs => tabs[0])
  }
}

function executeAction(tabId, action, data) {
  if (window.chrome) {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, { action, data }, {}, resolve)
    })
  } else if (window.browser) {
    return browser.tabs.sendMessage(tabId, { action, data })
  }
}

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

window.onload = async function() {
  main();

  window.close(); // To close the popup after finish
}

function main() {
  getCurrentTab()
    .then(tab => {
      const url = new URL(tab.url)
      if (url.host.endsWith('.aws.amazon.com')) {
        executeAction(tab.id, 'openBuddy', {});
      }
    })
}

