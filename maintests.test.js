const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");

describe("Viewtouch testing", () => {
  let io, serverSocket, clientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      console.log(port)
      clientSocket = new Client(`http://localhost:${port}`);
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  var neworders = [];
  var doneorders = [];
  var alldata = [];
////////////////////////////////////////////////////////////////test order addition
  test("Submit orders 1", (done) => {
    var order = [];
    var obj = { item: "Chapati", price: "20" };
    order.push(obj);
    clientSocket.emit("submitorder", {order})
    serverSocket.on("submitorder" ,msg => {
        msg.did = serverSocket.id+Date.now();
        msg.status = 0;
        neworders.push(msg)
        expect(neworders[0].status).toBe(0);
        done();
    });
  });

  test("Submit orders 2", (done) => {
    var order = [];
    var obj = { item: "order2", price: "14" };
    order.push(obj);
    clientSocket.emit("submitorder", {order})
    serverSocket.on("submitorder" ,msg => {
        msg.did = serverSocket.id;
        msg.status = 0;
        neworders.push(msg)
        expect(neworders[0].status).toBe(0);
        done();
    });
  });


  test("Request new orders", (done) => {
      serverSocket.on("requestneworders", (cb) => {
        cb(neworders);
      });
      clientSocket.emit("requestneworders", (arg) => {
        expect(arg).toEqual(neworders);
        done();
      });
  });

  test("Close an order", (done) => {
    var data = neworders[0]
    var did = data.did
    clientSocket.emit("closeorder", {data })
   
    serverSocket.on("closeorder" ,msg => {
        console.log(did)
        const index = neworders.findIndex((ord) => ord.did === did);
        if (index !== -1) {
            var newold = neworders.splice(index, 1)[0];
            newold.status = 1
            neworders.push(newold)
            io.sockets.emit("updatedlist", doneorders);
        }
        done();
    });

    clientSocket.on("updatedlist" ,msg => {
        const index = neworders.findIndex((ord) => ord.did === did);
        expect(index).not.toEqual(-1);
        if (index !== -1) {
            var newold = neworders.splice(index, 1)[0];
            expect(newold.status).toEqual(1);
        }
        done();
    });


});


test("Get closed orders", (done) => {
   
    serverSocket.on("getclosedorders" ,(cb) => {
        const index = neworders.findIndex((ord) => ord.status === 1);
        if (index !== -1) {
            var newold = neworders.splice(index, 1)[0];
            cb(newold)
        }
        done();
    });

    clientSocket.emit("getclosedorders" ,(arg) => {
        expect(arg.status).toEqual(1);
        done();
    });

   


});


  
//////////////////////////////////////////////////////////////////////////
//   test("should work (with ack)", (done) => {
//     serverSocket.on("hi", (cb) => {
//       cb("hola");
//     });
//     clientSocket.emit("hi", (arg) => {
//       expect(arg).toBe("hola");
//       done();
//     });
//   });
// });

// function todate() {
//   var date = Date();
//   var today = new Date();
//   var dd = String(today.getDate()).padStart(2, "0");
//   var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
//   var yyyy = today.getFullYear();
//   today = mm + "/" + dd + "/" + yyyy;
//   return today;
// }

// // test("Multiplying two numbers", async () => {
// //   expect(multiply(10, 10)).toStrictEqual(100);
// //   expect(multiply(200, 100)).toStrictEqual(20000);
// // })


})