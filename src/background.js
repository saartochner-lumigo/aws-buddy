

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

function getLambdaFunctionArn(name, region) {
    return `arn:aws:lambda:${region}:${getAccountId()}:function:${name}`;
}

function getLumigoUrl(name, region) {
    const arn = getLambdaFunctionArn(name, region);
    return `https://platform.lumigo.io/invocations/${arn}`;
}

function getAccountId() {  // TODO
    // return document.getElementsByClassName("globalNav-0336")[0].firstChild.childNodes[1].firstChild.data.replace("-", "").replace("-", "");
    return "256063301105"
}

function getResourceLumigoUrl(name) {
    return `https://platform.lumigo.io/explore?timespan=LAST_HOUR&distributionFilters=%7B%22resource%22:%5B%7B%22exclude%22:false,%22id%22:%22resource%22,%22value%22:%22${name}%22,%22ui%22:%7B%22displayName%22:%22Resource:%20${name}%22%7D%7D%5D%7D`
}

function urlToHistoryObject(url) {
    const urlParams = new URLSearchParams(url);
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
        return {name, url, service: "lambda-function", ...commonObj, lumigoUrl: getLumigoUrl(name, region)}
    }
    if (url.includes("console.aws.amazon.com/dynamodb/") && url.includes("#tables:selected=")) {
        let name = url.split("#tables:selected=")[1];
        if (name.includes(";")) {
            const cleanName = name.split(";")[0];
            url = url.replace(name, cleanName);
            name = cleanName;
        }
        return {name, url, service: "dynamodb-table", ...commonObj, lumigoUrl: getResourceLumigoUrl(name)}
    }


    if (url.includes("console.aws.amazon.com/dynamodbv2") && url.includes("buckets/")) {
        const regex = new RegExp("https:\\/\\/s3\\.console\\.aws\\.amazon\\.com\\/s3\\/buckets\\/(.*)\\?region=(.*)&", "g");

        const groups = regex.exec(url);
        return {name: groups[1], url, service: "s3-bucket",region: groups[2],counter: 1 , lumigoUrl: getResourceLumigoUrl(name)}
    }

    if (url.includes("console.aws.amazon.com/dynamodbv2") && urlParams.get('name') && urlParams.get('region')) {

        return {name: urlParams.get('name'), url, service: "dynamodb-table",region: urlParams.get('region'),counter: 1 , lumigoUrl: getResourceLumigoUrl(urlParams.get('name'))}
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
