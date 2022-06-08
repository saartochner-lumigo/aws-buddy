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

window.onload = function() {
  // chrome.storage.local.set({"AWS-HISTORY": []});
}

window.addEventListener("popup-modal", function(evt) {
  // We need to have this function in order for the listeners to be received
}, false);

function myFunction() {
  // Declare variables
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

const showBuddyModal = async () => {
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
    const history = await getHistoryObjects();
    let innerHtml =  `<input type="text" id="myInput" placeholder="Search for names..">
<style>
#myInput {
  background-position: 10px 12px; /* Position the search icon */
  background-repeat: no-repeat; /* Do not repeat the icon image */
  width: 90%; /* Full-width */
  font-size: 16px; /* Increase font-size */
  padding: 12px 20px 12px 40px; /* Add some padding */
  border: 1px solid #ddd; /* Add a grey border */
  margin-bottom: 12px; /* Add some space below the input */
}

#myTable {
  border-collapse: collapse; /* Collapse borders */
  width: 95%; /* Full-width */
  border: 1px solid #ddd; /* Add a grey border */
  font-size: 18px; /* Increase font-size */
}

#myTable th, #myTable td {
  text-align: left; /* Left-align text */
  padding: 12px; /* Add padding */
}

#myTable tr {
  /* Add a bottom border to all table rows */
  border-bottom: 1px solid #ddd;
}

#myTable tr.header, #myTable tr:hover {
  /* Add a grey background color to the table header and on hover */
  background-color: #f1f1f1;
}
</style>

    <table id="myTable">
      <tr class="header">
        <th style="width:20%;">Service</th>
        <th style="width:55%;">Name</th>
        <th style="width:20%;">Region</th>
        <th style="width:5%;"><3</th>
      </tr>
      `;

    console.log(history);
    for (let i = 0; i < history.length; i++) {
        const row = history[i];
        console.log(row);
        innerHtml += `<tr>
            <td>${row.service}</td>
            <td>${row.name}</td>
            <td>${row.region}</td>
            <td><a href="${row.lumigoUrl}">Lumigo</a></td>
          </tr>`
    }
    innerHtml += "</table>";
    console.log(history);

    modal.innerHTML = innerHtml;
    document.body.appendChild(modal);
    document.getElementById("myInput").addEventListener("keyup", myFunction);
    const dialog = document.querySelector("dialog");
    dialog.showModal();
}


(chrome || browser).runtime.onMessage.addListener(async function(msg, sender, cb) {
  const { data, action } = msg;
  if (action === 'openBuddy') {
        await showBuddyModal();
  }
});
