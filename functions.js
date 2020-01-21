'use strict';
const express = require('express');
const cors = require('cors');
const app = express();
const mysql = require('mysql');
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
            console.log('insertion       ', insertion);

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
            //connection.destroy();
            res.send({status: 400, message:err.message});
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


    let connection = await mysqlConnect();
    let query = "INSERT INTO `orders` (`restaurant_id`, `created_at`) VALUES ('"+id+"','"+date+"')";
    let rows = await queryExecution(query , connection);

    if(rows.status == 500){
        connection.destroy();
        return res.send(insertion);
    }else{
        
            let i=0 , array = [] , query1='' , itemsArray = [] , response = {};
            order.forEach(element => {
                i++;
                array.push(i);
                query1 +="INSERT INTO `order_items` (`order_id` ,`items`) VALUES ("+rows.message.insertId+", '"+element.itemName+"');";   
            });
            await bulkExecution(query1,array,connection);

          let getQuery = "SELECT orders.restaurant_id,orders.status,orders.created_at,order_items.items FROM `order_items`,`orders` WHERE orders.order_id = '"+rows.message.insertId+"' AND order_items.order_id = '"+rows.message.insertId+"';";
          let result = await queryExecution(getQuery , connection);
           
          for(let i=0 ; i<result.message.length ; i++){
              let record = {};
              if(i==0)
              {
                response.restaurantId = result.message[i].restaurant_id; 
                response.status = result.message[i].status;
                response.created_at = result.message[i].created_at;
              }

             record.itemName = result.message[i].items;
             itemsArray.push(record);
          }
          
          response.items = itemsArray;
          connection.destroy(); 
          res.send({status: 200 , message: 'successfully posted',result : response});
         
        }
    
}
catch(err){	
    console.log(err);
    connection.destroy();
    res.send({status: 400, message:err.message}); 
}   

}

async function updateOrder(req,res){
    console.log('updateTag called................');

try{
    let restaurant_id = req.body.restaurantid;
    let title = req.body.tagTitle;
    let tags = req.body.tags;
    let isDefault = req.body.is_default;
   
    if(!isDefault || isDefault== "")
        isDefault = 1;

    if(!tag_id || tag_id=="" || !tags || tags=="" || !title || title=="")
        return res.send({status: 400 , message: 'Required parameters are missing'});

    if(!Array.isArray(tags))
        return res.send({status: 403, message:'Something went wrong with tags array'});

    let date= new Date().toISOString();
    date = date.substr(0,date.length-1);
    
    let query = "UPDATE `tags` set `tag_title` = '"+title+"',`is_default` = '"+isDefault+"' , `created_at` = '"+date+"' WHERE `tag_id` = '"+tag_id+"';SELECT `title_id` FROM `tag_titles` WHERE `tag_id` = '"+tag_id+"';";

    let connection = await mysqlConnect();

    connection.query(query,async function (err, rows, fields) {
        if (err){
                console.log(err);
                connection.destroy();
                return res.send({status: 500 ,message: err});
        }else{
            if(rows.affectedRows==0){
                connection.destroy();
                return res.send({status: 404 , message: 'Tag not found'}); 
            }

            let i=0 , array = [] , query1 = '';

            tags.forEach(element => {
                i++;
                array.push(i);
                query1 +="UPDATE `tag_titles` set  `tag` = '"+element.tagName+"' WHERE `title_id` = '"+rows[1][i-1].title_id+"';";
            });

             await junkExecution(query1 , array , connection); 
          

        //   let roleQuery = "UPDATE `tag_titles` set  `role_title` = '"+role+"' WHERE role_id = '"+rows[1][0].role_id+"';";
        //   let title = await queryExecution(roleQuery , connection);

          let tagQuery = "SELECT tags.tag_id,tags.tag_title,tags.created_at,tag_titles.tag FROM `tag_titles`,`tags` WHERE tags.tag_id = '"+tag_id+"' AND tag_titles.tag_id = '"+tag_id+"';";
          let result = await queryExecution(tagQuery, connection);

          let response = {} , tagsArray = [];
          for(let i=0 ; i<result.length ; i++){
            let record = {};
            if(i==0)
            {
              response.tag_id = result[i].tag_id;
              response.tagTitle = result[i].tag_title;
              response.created_at = result[i].created_at;
            }
           //record.tag_id = result[i].tag_id;
           record.tagName = result[i].tag;
           tagsArray.push(record);
        }
            
          response.tags = tagsArray;
          
          connection.destroy(); 
          res.send({status: 200 , message: 'Tag has successfully updated',result : response});
         
        }
    }); 
    
}
catch(err){	
    console.log(err);
    connection.destroy(); 
    res.status(403).send({success:false, message:err.message});
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
module.exports = {
    addRestaurant,
    postOrder,
    updateOrder,
}