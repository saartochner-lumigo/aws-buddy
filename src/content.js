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
  return ((await readLocalStorage("AWS-HISTORY")) || []).sort((a, b) => b.counter - a.counter);
}

const colorLogs = () => {
    const iframe = document.getElementById("microConsole-Logs");
    if (iframe) {
        const logs = iframe.contentWindow.document
          .querySelectorAll("[data-testid=logs__log-events-table__message]");
        if (logs.length > 0) {
            logs.forEach(row => {
              if (row.innerText.toLowerCase().includes("error")) {
                  row.innerHTML = `<div style="color:red">${row.innerText}</div>`
              } else if (row.innerText.toLowerCase().includes("warn")) {
                  row.innerHTML = `<div style="color:orange">${row.innerText}</div>`
              } else if (row.innerText.startsWith("START RequestId: ")) {
                  const requestId = row.innerText.match("START RequestId: ([a-z0-9\-]{36}).*")[1]
                  const url = `https://platform.lumigo.io/explore?timespan=LAST_7_DAYS&searchTerm=${requestId}`;
                  const randomId = (Math.random() + 1).toString(36);
                  row.innerHTML = row.innerText + `<img border="0" id="${randomId}" alt="Go Lumigo" src="https://media-exp1.licdn.com/dms/image/C4D0BAQH8yD1ysPfutw/company-logo_200_200/0/1548375614844?e=2147483647&v=beta&t=Asv1wIW1iGgDuHQOpaPfcqYnI7Brq_SDN-8bZ8UpwOQ" width="40" height="40">`
                  iframe.contentWindow.document.getElementById(randomId).addEventListener("click", () => window.location.replace(url));
              }
            })
            return true;
      }
    }
    setTimeout(colorLogs, 500);
}

window.onload = function() {
  colorLogs();
}

window.addEventListener("popup-modal", function(evt) {
  // We need to have this function in order for the listeners to be received
}, false);

function myFunction() {
  // Declare variables
  var input, filter, table, tr, resourceName, i, txtValue, service, serviceTxtValue, region, regionTxtValue;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  const filters = filter.split(" ").filter(t => t !== "")
  console.log("filters",filters)
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tr.length; i++) {
    service = tr[i].getElementsByTagName("td")[0];
    resourceName = tr[i].getElementsByTagName("td")[1];
    region = tr[i].getElementsByTagName("td")[2];
    if(service || resourceName || region){
      txtValue = resourceName.textContent || resourceName.innerText;
      serviceTxtValue = service.textContent || service.innerText;
      regionTxtValue = region.textContent || region.innerText;
      console.log("resourceName",txtValue)
      filters.forEach(filter => {
        if (
          txtValue.toUpperCase().indexOf(filter) > -1 ||
          serviceTxtValue.toUpperCase().indexOf(filter) > -1 ||
          regionTxtValue.toUpperCase().indexOf(filter) > -1
        ) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      })
    }
  }
}

const showBuddyModal = async () => {
    const modal = document.createElement("dialog");
    modal.setAttribute(
        "style", `
height:50%;
width: 50%;
border: none;
top:150px;
border-radius:8px;
background-color:white;
position: fixed; box-shadow: 0px 12px 48px rgba(29, 5, 64, 0.32);
`
    );
    const history = [...(await getHistoryObjects()), ...mockData];
    let innerHtml =  `<input type="text" id="myInput" placeholder="Search for names..">
<style>
#myInput {
  background-position: 10px 12px; /* Position the search icon */
  background-repeat: no-repeat; /* Do not repeat the icon image */
  width: 44%; /* Full-width */
  font-size: 16px; /* Increase font-size */
  padding: 12px 20px 12px 40px; /* Add some padding */
  border: 1px solid #ddd; /* Add a grey border */
  margin-bottom: 12px; /* Add some space below the input */
  margin-left: 1%;
  position: fixed;
}

#dialogFooter {
  width: 44%; /* Full-width */
  padding: 12px 20px 12px 40px; /* Add some padding */
  margin-left: 1%;
  position: fixed;
  top: 77%;
  left: 60%;
}

#myTable {
  border-collapse: collapse; /* Collapse borders */
  width: 95%; /* Full-width */
  border: 1px solid #ddd; /* Add a grey border */
  font-size: 18px; /* Increase font-size */
  margin-left: 2%;
  margin-top: 6%;
  margin-bottom: 6%;
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

.TableRow td:hover {
  cursor: pointer;
}

</style>

    <table id="myTable">
      <tr class="header">
        <th style="width:20%;">Service</th>
        <th style="width:55%;">Name</th>
        <th style="width:20%;">Region</th>
        <th style="width:5%;">♥</th>
      </tr>
      `;

    console.log(history);
    for (let i = 0; i < history.length; i++) {
        const row = history[i];
        innerHtml += `<tr class="TableRow" id="row${i}">
            <td style="border: 1px solid #ddd">${row.service}</td>
            <td style="border: 1px solid #ddd">${row.name}</td>
            <td style="border: 1px solid #ddd">${row.region}</td>
            <td><a href="${row.lumigoUrl}"><img border="0" alt="Go Lumigo" src="https://media-exp1.licdn.com/dms/image/C4D0BAQH8yD1ysPfutw/company-logo_200_200/0/1548375614844?e=2147483647&v=beta&t=Asv1wIW1iGgDuHQOpaPfcqYnI7Brq_SDN-8bZ8UpwOQ" width="40" height="40"></a></td>
          </tr>`
    }
    innerHtml += `</table>
    <div id="dialogFooter">Powered By <img border="0" alt="Go Lumigo" src="https://42vnof42im1n3ecs8l2w7ez1-wpengine.netdna-ssl.com/wp-content/uploads/2022/06/Lumigo-Pride-Logov3-orig.png"></div>`;

    modal.innerHTML = innerHtml;
    document.body.appendChild(modal);
    document.getElementById("myInput").addEventListener("keyup", myFunction);
    for (let i = 0; i < history.length; i++) {
        document.getElementById(`row${i}`).addEventListener("click", () => window.location.replace(history[i].url));
    }
    const dialog = document.querySelector("dialog:last-child");
    dialog.showModal();
}


(chrome || browser).runtime.onMessage.addListener(async function(msg, sender, cb) {
  const { data, action } = msg;
  if (action === 'openBuddy') {
        await showBuddyModal();
  }
});
