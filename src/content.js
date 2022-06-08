window.onload = function() {
  chrome.storage.local.set({"AWS-HISTORY": []});
}

window.addEventListener("popup-modal", function(evt) {
  // We need to have this function in order for the listeners to be received
}, false);


(chrome || browser).runtime.onMessage.addListener(function(msg, sender, cb) {
  const { data, action } = msg;
  if (action === 'openBuddy') {
    document.getElementsByClassName("awsui_heading-text_2qdw9_s2c65_262")[0].childNodes[0].data = 'Bla';
  }
});
