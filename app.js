// create an express app
const express = require("express");
const app = express();
const bodyParser=require('body-parser');
const path = require('path');
const axios = require('axios');
var token;
var request = require('request');
const xmlParser = require('xml2json');
var xml;
var jsonRes;
var SourceListDEResult;

// use the express-static middleware
app.use(express.static("marketing-cloud-query-app"));
app.use(bodyParser.urlencoded({extended:true}));

// define the first route
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + '/loginpage.html'));
})
app.set('view engine', 'html');
app.post("/secondpage", function (req, res) {
   var clientidSource = req.body.clientid;
   var clientsecretSource = req.body.clientsecret;
   var clinentauthurl= req.body.authurl;
   console.log('Avi '+ clientidSource,'Avi1 '+ clientsecretSource,'Avi2 '+ clinentauthurl);
   //alert('Avi'+ clientidSource,'Avi1'+ clientsecretSource,'Avi2'+ clinentauthurl);
   
   var FormData = require('form-data');
   var data = new FormData();
   data.append('grant_type', 'client_credentials');
   data.append('client_id', clientidSource);
   data.append('client_secret', clientsecretSource);
   // data.append('account_id', '514011820');
   
  var config = {
     method: 'post',
     url: clinentauthurl,
     headers: { 
       'Content-Type': 'application/json', 
       ...data.getHeaders()
     },
     data : data
   };
   
   axios(config)
   .then(function (response) {
   
    // console.log(JSON.stringify(response.data));
    token=response.data.access_token;
    //console.log(token);
   })
   .catch(function (error) {
     console.log(error);
   });
  

   async function fun1(){
     let promise = new Promise((res, rej) => {
    setTimeout(() => res("Now it's done!"), 10000)
});

// wait until the promise returns us a value
let result = await promise; 
   var body1='<?xml version="1.0" encoding="UTF-8"?>\r\n<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">\r\n    <s:Header>\r\n        <a:Action s:mustUnderstand="1">Retrieve</a:Action>\r\n        <a:To s:mustUnderstand="1">https://mc6vgk-sxj9p08pqwxqz9hw9-4my.soap.marketingcloudapis.com/Service.asmx</a:To>\r\n        <fueloauth xmlns="http://exacttarget.com">'+token+'</fueloauth>\r\n    </s:Header>\r\n    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\r\n        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">\r\n            <RetrieveRequest>\r\n                <ObjectType>DataExtension</ObjectType>\r\n                <Properties>ObjectID</Properties>\r\n                <Properties>CustomerKey</Properties>\r\n                <Properties>Name</Properties>\r\n                <Properties>IsSendable</Properties>\r\n                <Properties>SendableSubscriberField.Name</Properties>\r\n               \r\n            </RetrieveRequest>\r\n        </RetrieveRequestMsg>\r\n    </s:Body>\r\n</s:Envelope>'
   var options = {
     'method': 'POST',
     'url': 'https://mc6vgk-sxj9p08pqwxqz9hw9-4my.soap.marketingcloudapis.com/Service.asmx',
     'headers': {
       'Content-Type': 'text/xml',
       'SoapAction': 'Retrieve'
     },
     body:body1 
    
   };
   //console.log("Token "+ token);
   //console.log("Debody "+ body1);

   request(options, function (error, response)  {
    if (error) throw new Error(error);
     xml=response.body;
     SourceListDEResult = xml.replace(/:/g, "");
     SourceListDEResult = xmlParser.toJson(SourceListDEResult);
     //console.log("yeh hai de ki response ki json body" +SourceListDEResult);
     SourceListDEResult = JSON.parse(SourceListDEResult);
     var ResultList  = SourceListDEResult.soapEnvelope.soapBody.RetrieveResponseMsg.Results;
        //console.log("Result list " + JSON.stringify(ResultList)); 
        var targetDEArray = [];
        ResultListMap = {};
        for (var key in ResultList) 
       {
        console.log("Data Extension " + ResultList[key].Name)   
         targetDEArray.push(ResultList[key].Name);
         ResultListMap[ResultList[key].Name] = ResultList[key] ; 
       }
     
    });
    
  

   

   
  
  
   }




  
  
   fun1();
   
   res.sendFile(path.join(__dirname + '/secondpage.html'));

});









  
  



  // start the server listening for requests
app.listen(process.env.PORT || 3000, 
	() => console.log("Server is running."));
  