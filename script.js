let authToken = "";
let tableData = document.querySelector('.dataDisplay');
let dataToDisplay = [];
let linkAPI = "https://ap-southeast-1.aws.data.mongodb-api.com/app/data-xarjbie/endpoint/data/v1/action/";

let thisMonth = new Date().getMonth() + 1;

thisMonth < 10 ? thisMonth = "0" + thisMonth : String(thisMonth);

let filter = {
  "$expr": {
    "$eq": [
      { "$substr": ["$date", 5, 2] },
      thisMonth
    ]
  },
};

let db = "bastianaxel";
let collection = "uang";

fetch('https://ap-southeast-1.aws.services.cloud.mongodb.com/api/client/v2.0/app/data-xarjbie/auth/providers/local-userpass/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "username": "bastianaxel1105@gmail.com",
    "password": "axeleus1105"
  })
}).then(response => response.json())
  .then(data => {
    authToken = data.access_token;
    selectData(authToken, filter);
    seluruhUang();
  })
  .catch(error => {
    console.error('Terjadi kesalahan:', error);
  });

function selectData(authToken, filter) {
  fetch(linkAPI + 'find', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'Authorization': `Bearer ${authToken}` // Ganti <ACCESS_TOKEN> dengan token yang benar
    },
    body: JSON.stringify({
      "collection": collection,
      "database": db,
      "dataSource": "Cluster0",
      "filter": filter,
      "sort": { "date": -1 }
    })
  })
    .then(response => response.json())
    .then(data => {

      dataToDisplay = data.documents;

      tampilData(dataToDisplay);

    })
    .catch(error => {
      console.error('Terjadi kesalahan:', error);
    });
}

function tambahData(authToken, newData) {
  fetch(linkAPI + 'insertOne', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'Authorization': `Bearer ${authToken}` // Ganti <ACCESS_TOKEN> dengan token yang benar
    },
    body: JSON.stringify({
      "collection": collection,
      "database": db,
      "dataSource": "Cluster0",
      "document": newData
    })
  })
    .then(response => response.json())
    .then(data => {
      console.log(data)
      location.reload();
    })
    .catch(error => {
      console.error('Terjadi kesalahan:', error);
    });
}

function updateData(authToken, rowId, newdata) {
  fetch(linkAPI + 'updateOne', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'Authorization': `Bearer ${authToken}` // Ganti <ACCESS_TOKEN> dengan token yang benar
    },
    body: JSON.stringify({
      "collection": collection,
      "database": db,
      "dataSource": "Cluster0",
      "filter": { _id: { "$oid": rowId } },
      "update": { "$set": newdata }
    })
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      location.reload();
    })
    .catch(error => {
      console.error('Terjadi kesalahan:', error);
    });
}

function hapusData(authToken, rowId, total) {
  fetch(linkAPI + 'delete' + total, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'Authorization': `Bearer ${authToken}` // Ganti <ACCESS_TOKEN> dengan token yang benar
    },
    body: JSON.stringify({
      "collection": collection,
      "database": db,
      "dataSource": "Cluster0",
      "filter": { _id: { "$oid": rowId } }
    })
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      location.reload();
    })
    .catch(error => {
      console.error('Terjadi kesalahan:', error);
    });
}

function tampilData(dataToDisplay) {
  let pemasukanEl = document.querySelector(".pemasukan");
  let pengeluaranEl = document.querySelector(".pengeluaran");
  let pemasukan = 0;
  let pengeluaran = 0;

  if (dataToDisplay.length > 0) {
    dataToDisplay.forEach(element => {
      tableData.innerHTML += `<div data-rowid='${element._id}' class='row'>
                                  <div class='row-item'>
                                      <img src='image/${element.source}.svg'>
                                      <div class="middle">
                                          <h2>${element.source}</h2>
                                          <p class='date-data'>${element.date}</p>
                                      </div>
                                      <h3>${element.angka}</h3>
                                  </div>
                              </div>`
    });

    let rowBtn = document.querySelectorAll(".row");

    rowBtn.forEach(element => {
      element.addEventListener("click", () => {

        let rowId = element.dataset.rowid;

        fetch(linkAPI + 'findOne', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Request-Headers': '*',
            'Authorization': `Bearer ${authToken}` // Ganti <ACCESS_TOKEN> dengan token yang benar
          },
          body: JSON.stringify({
            "collection": collection,
            "database": db,
            "dataSource": "Cluster0",
            "filter": { _id: { "$oid": rowId } }
          })
        })
          .then(response => response.json())
          .then(data => {

            let result = data.document;

            let modal = document.querySelector("#update");
            let closeBtn = modal.querySelectorAll(".close-btn");
            let updateBtn = modal.querySelector(".updateBtn");
            let deleteBtn = modal.querySelector(".deleteBtn");

            modal.showModal();

            let date = modal.querySelector("#date");
            let angka = modal.querySelector("#angka");
            let source = modal.querySelector("#source");
            let tipe = modal.querySelector("#tipe");
            let note = modal.querySelector("#note");

            date.value = result.date
            angka.value = result.angka
            source.value = result.source
            tipe.value = result.tipe
            note.value = result.note

            updateBtn.addEventListener("click", () => {

              let dataNew = {
                "date": date.value,
                "angka": Number(angka.value),
                "source": source.value,
                "tipe": tipe.value,
                "note": note.value
              }

              if (dataNew.tipe == "income" && dataNew.angka < 0) {
                dataNew.angka *= -1;
              } else if (dataNew.tipe == "outcome" && dataNew.angka > 0) {
                dataNew.angka *= -1;
              }

              updateData(authToken, rowId, dataNew)

            })

            deleteBtn.addEventListener("click", () => {
              hapusData(authToken, rowId, "One")
            })

            closeBtn.forEach(e => {
              e.addEventListener("click", () => {
                modal.close();
              })
            });
          })
          .catch(error => {
            console.error('Terjadi kesalahan:', error);
          });

      })
    });

    dataToDisplay.forEach(e => {
      e.angka > 0 ? pemasukan += e.angka : pengeluaran += e.angka;
    });

    pemasukanEl.innerHTML = "Rp. " + pemasukan;
    pengeluaranEl.innerHTML = "Rp. " + pengeluaran;
  } else {
    tableData.innerHTML += `<div class="data-empty">
                              <img src="image/alert.png" alt="">
                              <h2>No Data</h2>
                            </div>`
    pemasukanEl.innerHTML = "Rp. 0"
    pengeluaranEl.innerHTML = "Rp. 0"
  }
}

let insertBtn = document.querySelector(".insertBtn");

insertBtn.addEventListener("click", (e) => {
  e.preventDefault();
  let date = document.querySelector("#date").value;
  let angka = Number(document.querySelector("#angka").value);
  let tipe = document.querySelector("#tipe").value;
  let note = document.querySelector("#note").value;
  let source = document.querySelector("#source").value;

  if (tipe === "outcome") {
    angka *= -1;
  }

  tambahData(authToken, { "date": date, "angka": angka, "source": source, "tipe": tipe, "note": note });

})

let modalBtn = document.querySelectorAll(".modal-btn");

modalBtn.forEach(btn => {
  btn.addEventListener("click", () => {
    let modalId = btn.dataset.targetmodal;
    let modal = document.querySelector(modalId)
    let closeBtn = modal.querySelectorAll(".close-btn");

    modal.showModal();

    closeBtn.forEach(e => {
      e.addEventListener("click", () => {
        modal.close();
      })
    });

  })
});


let dataFilter = document.querySelectorAll(".dataFilter");

dataFilter[0].value = thisMonth;

let apapunitu = dataFilter[0];

dataFilter.forEach(e => {
  e.addEventListener("change", () => {

    tableData.innerHTML = "";

    let selectedDate = dataFilter[0].value;
    let selectedSource = dataFilter[1].value;

    if (selectedSource == "All") {
      selectData(authToken, {
        "$expr": {
          "$eq": [
            { "$substr": ["$date", 5, 2] },
            selectedDate
          ]
        }
      })
    } else {
      selectData(authToken, {
        "$and": [
          { "source": selectedSource },
          {
            "$expr": {
              "$eq": [
                { "$substr": ["$date", 5, 2] },
                selectedDate
              ]
            }
          }
        ]
      })
    }

  })
});


function seluruhUang(){
  fetch(linkAPI + "find", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'Authorization': `Bearer ${authToken}` // Ganti <ACCESS_TOKEN> dengan token yang benar
    },
    body: JSON.stringify({
      "collection": collection,
      "database": db,
      "dataSource": "Cluster0"
    })
  })
    .then(response => response.json())
    .then(data => {
  
      let totalUang = document.querySelector(".total-uang");
      let uang = 0;
      let ujicoba = data.documents;
  
      ujicoba.forEach(element => {
        uang += element.angka
      });
  
      totalUang.innerHTML = "Rp. " + uang;

    })
    .catch(error => {
      console.error('Terjadi kesalahan:', error);
    });
}