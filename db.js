var redis = require("redis");
var client = redis.createClient(); //6379, "127.0.0.1"

async function dbconnect() {
  client.on("error", function (err) {
    console.log("Error " + err);
  });

  client.on("connect", function () {
    console.log("Connected!");
  });
}

function dbtestconection() {
  client.set("working_days", 5, function () {
    client.incr("working_days", function (err, reply) {
      console.log(reply); // 6
    });
  });

  client.hmset("frameworks_hash", {
    javascript: "ReactJS",
    css: "TailwindCSS",
    node: "Express",
  });

  client.hmset("frameworks_hash", {
    javascript: "RgfgfgfactJS",
    css: "TailwindCSS",
    node: "Express",
  });

  client.hmset("frameworks_hash", {
    javascript: "ReyyactJS",
    css: "TailwindCSS",
    node: "Express",
  });

  client.hgetall("frameworks_hash", function (err, object) {
    console.log(object); // { javascript: 'ReactJS', css: 'TailwindCSS', node: 'Express' }
  });
}

module.exports = {
  dbconnect,
  dbtestconection,
};
