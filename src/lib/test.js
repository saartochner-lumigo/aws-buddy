const urlParams = new URLSearchParams("https://us-east-1.console.aws.amazon.com/dynamodbv2/home?region=us-east-1#table?initialTagKey=&name=sls-blind-chat-staging-messages&tab=overview");
const product = urlParams.get('region')
console.log(product);
// shirt

const color = urlParams.get('name')
console.log(color);
// blue

