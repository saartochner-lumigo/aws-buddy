window.onload = function() {
  // chrome.storage.local.set({"AWS-HISTORY": []});
}

window.addEventListener("popup-modal", function(evt) {
  // We need to have this function in order for the listeners to be received
}, false);

const showBuddyModal = () => {
    const modal = document.createElement("dialog");
    modal.setAttribute(
        "style", `
height:300px;
width: 50%;
border: none;
top:150px;
border-radius:20px;
background-color:white;
position: fixed; box-shadow: 0px 12px 48px rgba(29, 5, 64, 0.32);
`
    );
    modal.innerHTML =  `<div>
This is our content
</div>`;
    document.body.appendChild(modal);
    const dialog = document.querySelector("dialog");
    dialog.showModal();
    const iframe = document.getElementById("popup-content");
    // iframe.src = chrome.extension.getURL("index.html");
    iframe.frameBorder = 0;
    dialog.querySelector("button").addEventListener("click", () => {
        dialog.close();
    });
}


(chrome || browser).runtime.onMessage.addListener(function(msg, sender, cb) {
  const { data, action } = msg;
  if (action === 'openBuddy') {
        showBuddyModal();
  }
});
