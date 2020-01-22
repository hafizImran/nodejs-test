'use strict';
var express = require('express');
var cors = require('cors');
var app = express();
var endpoints = require('./functions.js');
var mysql = require('mysql');
app.use(cors());
app.use(express.json());

app.post('/addRestaurant', async function(req, res){
		
	endpoints.addRestaurant(req, res);
	
});
app.post('/postOrder', async function(req, res){
		
	endpoints.postOrder(req, res);
	
});
app.put('/updateOrder', async function(req, res){
		
	endpoints.updateOrder(req, res);
	
});
app.post('/changeOrderStatus', async function(req, res){
		
	endpoints.changeOrderStatus(req, res);
	
});
app.delete('/deleteOrder', async function(req, res){
		
	endpoints.deleteOrder(req, res);
	
});
app.get('/getAllOrders', async function(req, res){
		
	endpoints.getAllOrders(req, res);
	
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection. This might crash the service');
    console.log('Unhandled Rejection at:', reason.stack || reason);
  })
  
  process.on('uncaughtException', (reason, promise) => {
    console.log('Uncaught Exception. This might crash the service');
    console.log('Unhandled Exception at:', reason.stack || reason)
  })
let server = app.listen(3000, function () {

    var port = server.address().port;
    console.log("Service is listening at port :%s", port);

})
