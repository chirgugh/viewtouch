const mongodb = require("mongodb");
var password = encodeURIComponent("wdkOVf59M43WZ3Qq");
const uri =
  "mongodb+srv://jesse:" +
  password +
  "@cluster0.fzrgv.mongodb.net/?retryWrites=true&w=majority";
const client = mongodb.MongoClient;

var database;

client.connect(uri, function (err, db) {
  if (err) {
    console.log("an error occured", err);
  } else {
    console.log("Database created!");
    database = db.db("viewtouch");
  }
});

async function connectmongo() {
  // we'll add code here soon
  console.log(uri);
  // client.connect(uri, function(err, db) {
  //     if (err){
  //         console.log("an error occured" ,err)
  //     }else{

  //         console.log("Database created!");
  //         database = db.db("viewtouch");
  //     }

  //   });
}

async function addordermongo(data) {
  database.collection("orders").insertOne(data, function (err, res) {
    if (err) {
      console.log(err);
    } else {
      console.log("order added to mongo");
    }
  });
}

async function getoldorders() {
  var array1 = await database.collection("orders").find({ status: { $eq: 1 }}).toArray();

  // console.log(array1)
   return array1
}


async function getneworders() {
  var array1 = await database.collection("orders").find({ status: { $eq: 0 }}).toArray();

  // console.log(array1)
   return array1
}


async function updateorders(did){
  database.collection("orders").updateOne( { did: did }, { $set: { status: 1}} , function(err, res) {
    if (err) throw err;
    console.log(did, " status updated");
  })
}


async function getallorders() {
  var array1 = await database.collection("orders").find().toArray();

  // console.log(array1)
   return array1
}



module.exports = {
  connectmongo,
  addordermongo,
  getoldorders,
  getneworders,
  updateorders,
  getallorders,
};
