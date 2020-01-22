'use strict';
const express = require('express');
const cors = require('cors');
const app = express();
const mysql = require('mysql');
const CronJob = require('cron').CronJob;
app.use(cors());
app.use(express.json());
//https://github.com/hafizImran/nodejs-test
var connection="";
//==================================================    SQL Connection function         ========================================================
function mysqlConnect() {
    return new Promise(resolve => {
  
        connection = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : '', 
            database : 'test',
            multipleStatements: true,
            timezone: 'utc', 
	        connectTimeout : 60000
        });
        connection.connect();
        resolve(connection);

    });
}
//===========================================       Add Restaurant      ===============================================
async function addRestaurant(req , res){
    console.log('addRestaurant called....................');
    try{

        let name    = req.body.restaurantName;
        let contact = req.body.contact;
        let address = req.body.address;

        if(!name || name=="" || !contact || contact=="" || !address || address=="")
            return res.send({status: 400 ,  message: 'Required parameters are missing'});

            let connection = await mysqlConnect();
            let query = "INSERT INTO `restaurants` (`name`, `contact`,`address`) VALUES ('"+name+"','"+contact+"','"+address+"')";
            let insertion = await queryExecution(query , connection);

            if(insertion.status == 500){
                connection.destroy();
                if(insertion.message.errno == 1062)
                    return res.send({status : 400 , message: 'Already registered'});
                return res.send(insertion);
            }
            
                let getQuery = "SELECT * FROM `restaurants` WHERE `id` = '"+insertion.message.insertId+"';";
                let result = await queryExecution(getQuery , connection);
                 
                 
                connection.destroy(); 
                res.send({status: 200 , message: 'successfully registered',result : result});
                 
        }
          
        catch(err){	
            console.log(err);
            res.send({status: 400, message:err.message});
            connection.destroy();
        }   
    
}
async function postOrder(req,res){
    console.log('postOrder called................');

try{
    let id    = req.body.restaurantId;
    let order = req.body.order;

    let date= new Date().toISOString();
    date = date.substr(0,date.length-1);

    if(!id || id=="" || !order || order=="")
        return res.send({status: 400 , message: 'Required parameters are missing'});

    if(!Array.isArray(order))
        return res.send({status: 400, message:'Required array of orders'});

    let items = [];
    for(let i=0 ; i<order.length ; i++)
    {
        items.push(order[i].itemName);
    }
    items = items.toString();
    let connection = await mysqlConnect();
    let query = "INSERT INTO `orders` (`restaurant_id`, `created_at`,`items`) VALUES ('"+id+"','"+date+"','"+items+"')";
    let rows = await queryExecution(query , connection);

    if(rows.status == 500){
        connection.destroy();
        return res.send(rows);
    }else{
        
          let getQuery = "SELECT * FROM `orders` WHERE order_id = '"+rows.message.insertId+"';";
          let result = await queryExecution(getQuery , connection);
          
          let getItems = result.message[0].items.split(',');
          
          let itemsArray = [] , response = {};
          for(let i=0 ; i<getItems.length ; i++){
              let record = {};
              if(i==0)
              {
                response.orderId = result.message[i].order_id;
                response.restaurantId = result.message[i].restaurant_id; 
                response.status = result.message[i].status;
                response.created_at = result.message[i].created_at;
              }

             record.itemName = getItems[i];
             itemsArray.push(record);
          }
          
          response.items = itemsArray;
          connection.destroy(); 
          res.send({status: 200 , message: 'successfully posted',result : response});
         
        }
    
}
catch(err){	
    console.log(err);
    res.send({status: 400, message:err.message});
    connection.destroy(); 
}   

}
async function updateOrder(req,res){
    console.log('updateOrder called................');

try{
    let id    = req.body.orderId;
    let order = req.body.order;

    let date= new Date().toISOString();
    date = date.substr(0,date.length-1);

    if(!id || id=="" || !order || order=="")
        return res.send({status: 400 , message: 'Required parameters are missing'});

    if(!Array.isArray(order))
        return res.send({status: 400, message:'Required array of orders'});

    let items = [];
    for(let i=0 ; i<order.length ; i++)
    {
        items.push(order[i].itemName);
    }
    items = items.toString();
    let connection = await mysqlConnect();
    let query = "UPDATE `orders` SET `items` = '"+items+"' , `created_at` = '"+date+"' WHERE `order_id` = '"+id+"';";
    let rows = await queryExecution(query , connection);

    if(rows.status == 500){
        connection.destroy();
        return res.send(rows);
    }else{
        if(rows.message.affectedRows == 0){
            connection.destroy();
            return res.send({status: 404 , message: 'order not found'})
        }
        
          let getQuery = "SELECT * FROM `orders` WHERE order_id = '"+id+"';";
          let result = await queryExecution(getQuery , connection);
          
          let getItems = result.message[0].items.split(',');
          
          let itemsArray = [] , response = {};
          for(let i=0 ; i<getItems.length ; i++){
              let record = {};
              if(i==0)
              {
                response.orderId = result.message[i].order_id;
                response.restaurantId = result.message[i].restaurant_id; 
                response.status = result.message[i].status;
                response.created_at = result.message[i].created_at;
              }

             record.itemName = getItems[i];
             itemsArray.push(record);
          }
          
          response.items = itemsArray;
          connection.destroy(); 
          res.send({status: 200 , message: 'successfully updated',result : response});
         
        }
    
}
catch(err){	
    console.log(err);
    res.send({status: 400, message:err.message});
    connection.destroy();

}   

}
async function changeOrderStatus(req,res){
    console.log('orderPreparingStatus called................');

try{
    let id    = req.body.orderId;
    let status = req.body.status.toUpperCase();

    if(status != 'PREPARING' && status != 'COMPLETED')
        return res.send({status: 400 , message: 'Invalid status'});


    if(!id || id=="" || !status || status=="")
        return res.send({status: 400 , message: 'Required parameters are missing'});

    let connection = await mysqlConnect();
    let query = "UPDATE `orders` SET `status` = '"+status+"' WHERE `order_id` = '"+id+"';";
    let rows = await queryExecution(query , connection);

    if(rows.status == 500){
        connection.destroy();
        return res.send(rows);
    }else{
        if(rows.message.affectedRows == 0){
            connection.destroy();
            return res.send({status: 404 , message: 'order not found'})
        }
        
          let getQuery = "SELECT * FROM `orders` WHERE order_id = '"+id+"';";
          let result = await queryExecution(getQuery , connection);
          
          let getItems = result.message[0].items.split(',');
          
          let itemsArray = [] , response = {};
          for(let i=0 ; i<getItems.length ; i++){
              let record = {};
              if(i==0)
              {
                response.orderId = result.message[i].order_id;
                response.restaurantId = result.message[i].restaurant_id; 
                response.status = result.message[i].status;
                response.created_at = result.message[i].created_at;
              }

             record.itemName = getItems[i];
             itemsArray.push(record);
          }
          
          response.items = itemsArray;
          connection.destroy(); 
          res.send({status: 200 , message: 'status successfully changed',result : response});
         
        }
    
}
catch(err){	
    console.log(err);
    res.send({status: 400, message:err.message}); 
    connection.destroy();

}   

}
async function deleteOrder(req,res){
    console.log('deleteOrder called................');

try{
    let orderId    = req.body.orderId;
    let restaurantId = req.body.restaurantId;

    if(!orderId || orderId=="" || !restaurantId || restaurantId=="")
        return res.send({status: 400 , message: 'Required parameters are missing'});

    let connection = await mysqlConnect();
    let query = "DELETE FROM `orders` WHERE `order_id` = '"+orderId+"' AND `restaurant_id` = '"+restaurantId+"';";
    let rows = await queryExecution(query , connection);
    connection.destroy();

    if(rows.status == 500)
        return res.send(rows); 
    else{

        if(rows.message.affectedRows == 0)
            return res.send({status: 404 , message: 'order not found'})
        
        res.send({status: 200 , message: 'order successfully deleted'});
         
        }
    
}
catch(err){	
    console.log(err);
    res.send({status: 400, message:err.message}); 
    connection.destroy();
}   

}
async function getAllOrders(req,res){
    console.log('getAllOrders called................');

try{
    let restaurantId = req.query.restaurantId;

    if(!restaurantId || restaurantId=="")
        return res.send({status: 400 , message: 'Required parameters are missing'});

    let connection = await mysqlConnect();
    let query = "SELECT * FROM `orders` WHERE  `restaurant_id` = '"+restaurantId+"';";
    let rows = await queryExecution(query , connection);
    connection.destroy();
    console.log(rows);

    if(rows.status == 500)
        return res.send(rows); 
    else{

        if(rows.message.length == 0)
            return res.send({status: 404 , message: 'order not found'});

        let getItems = [] , responseArray = []   ;
        for(let i=0 ; i<rows.message.length ; i++){
            let response = {} ,  itemsArray = [];
            response.orderId = rows.message[i].order_id;
            response.restaurantId = rows.message[i].restaurant_id; 
            response.status = rows.message[i].status;
            response.created_at = rows.message[i].created_at;

            getItems = rows.message[i].items.split(',');
            for(let j=0 ; j<getItems.length ; j++){
                let record = {};
  
               record.itemName = getItems[j];
               itemsArray.push(record);
            }
            response.items = itemsArray;
            responseArray.push(response);
        }

            
            
            
        
        res.send({status: 200 , message: 'order successfully deleted' , orders: responseArray});
         
        }
    
}
catch(err){	
    console.log(err);
    res.send({status: 400, message:err.message}); 
    connection.destroy();
}   

}
function queryExecution(query,connection){
	return new Promise(async resolve => {
		
		connection.query(query ,async function(err , result){
			if(err)
			{
                console.log(err);
				resolve ({status: 500, message : err});
			}
			else
			{	console.log('query execution');
				resolve({status : 200 , message : result});
			}
		});
		
	});
}
function bulkExecution(query,array,con){
	return new Promise(async resolve => {
		con.query(query,array, async function(err , result){
			if(err)
			{
                console.log('error ',err);
				resolve ({status: 500, message : err});
			}
			else
			{
				resolve({status : 200 , message : result});
			}
		});
		
	});
}
const job = new CronJob('* * * * *', async function() {

    let connection=await mysqlConnect();
    let query = "DELETE FROM `orders` WHERE `status` = 'COMPLETED';";
    let result = await queryExecution(query,connection);
    
      console.log('is job running? ', job.running );
    connection.destroy();
});
  job.start(); 
module.exports = {
    addRestaurant,
    postOrder,
    updateOrder,
    changeOrderStatus,
    deleteOrder,
    getAllOrders
}