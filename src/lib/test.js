function getDDBLumigoUrl(name) {
  return `https://platform.lumigo.io/explore?timespan=LAST_HOUR&distributionFilters=%7B%22resource%22:%5B%7B%22exclude%22:false,%22id%22:%22resource%22,%22value%22:%22${name}%22,%22ui%22:%7B%22displayName%22:%22Resource:%20${name}%22%7D%7D%5D%7D`
}

function getS3Name(url){
  if (url.includes("https://s3.console.aws.amazon.com/s3") && url.includes("buckets/")) {
    const regex = new RegExp("https:\\/\\/s3\\.console\\.aws\\.amazon\\.com\\/s3\\/buckets\\/(.*)\\?region=(.*)&", "g");

    const groups = regex.exec(url);
    return {name: groups[1], url, service: "s3-bucket",region: groups[2], lumigoUrl: getDDBLumigoUrl(groups[1])}
  }
}


console.log(getS3Name("https://s3.console.aws.amazon.com/s3/buckets/angels-alerting-stls-serverlessdeploymentbucket-19zzdj2z8226e?region=us-west-2&tab=objects"))

