let authToken = "";
let tableData = document.querySelector('table');
let dataToDisplay = [];

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
  selectData(authToken, {});
})
.catch(error => {
  console.error('Terjadi kesalahan:', error);
})

function selectData(authToken, filter){
  fetch('https://ap-southeast-1.aws.data.mongodb-api.com/app/data-xarjbie/endpoint/data/v1/action/find', {
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
      "sort": {"date": -1}
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
    fetch('https://ap-southeast-1.aws.data.mongodb-api.com/app/data-xarjbie/endpoint/data/v1/action/insertOne', {
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

function tampilData(dataToDisplay){
    dataToDisplay.forEach(element => {
        tableData.innerHTML += `<tr>
                                    <td>${element.date}</td>
                                    <td>${element.angka}</td>
                                    <td>${element.source}</td>
                                    <td>${element.tipe}</td>
                                    <td>${element.note}</td>
                                </tr>`
    });
}

let insertBtn = document.querySelector(".insertBtn");

insertBtn.addEventListener("click", ()=>{
    let date = document.querySelector("#date").value;
    let angka = document.querySelector("#angka").value;
    let tipe = document.querySelector("#tipe").value;
    let note = document.querySelector("#note").value;
    let source = document.querySelector("#source").value;

    tambahData(authToken, {"date": date, "angka": angka, "source": source, "tipe": tipe, "note": note});

})
