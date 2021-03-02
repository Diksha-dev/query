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
var xml2js = require('xml2js');
var xml2jsParser = new xml2js.Parser();
var DEListMap;

// use the express-static middleware
app.use(express.static("marketing-cloud-query-app"));
app.use(bodyParser.urlencoded({extended:true}));

// define the first route
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + '/loginpage.html'));
})
app.set('view engine', 'html');
app.post("/secondpage", async function (req, res) {
   var clientidSource = req.body.clientid;
   var clientsecretSource = req.body.clientsecret;
   var clinentauthurl= req.body.authurl;
   var granttypeSource = "client_credentials" ;
  //  console.log('Avi '+ clientidSource,'Avi1 '+ clientsecretSource,'Avi2 '+ clinentauthurl);
   //alert('Avi'+ clientidSource,'Avi1'+ clientsecretSource,'Avi2'+ clinentauthurl);
   
   var access_token= await getacesstoken(clientidSource,clientsecretSource,granttypeSource);

   res.sendFile(path.join(__dirname + '/secondpage.html'));

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
    console.log("token" + token);
   })
   .catch(function (error) {
  //   console.log(error);
   });
  
   

   app.post("/asset", async (reqCall,resCall)=>
   {
    console.log("yeh app.post me hai token" + access_token);
    var body1='<?xml version="1.0" encoding="UTF-8"?>\r\n<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">\r\n    <s:Header>\r\n        <a:Action s:mustUnderstand="1">Retrieve</a:Action>\r\n        <a:To s:mustUnderstand="1">https://mc6vgk-sxj9p08pqwxqz9hw9-4my.soap.marketingcloudapis.com/Service.asmx</a:To>\r\n        <fueloauth xmlns="http://exacttarget.com">'+access_token+'</fueloauth>\r\n    </s:Header>\r\n    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\r\n        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">\r\n            <RetrieveRequest>\r\n                <ObjectType>DataExtension</ObjectType>\r\n                <Properties>ObjectID</Properties>\r\n                <Properties>CustomerKey</Properties>\r\n                <Properties>Name</Properties>\r\n                <Properties>IsSendable</Properties>\r\n                <Properties>SendableSubscriberField.Name</Properties>\r\n               \r\n            </RetrieveRequest>\r\n        </RetrieveRequestMsg>\r\n    </s:Body>\r\n</s:Envelope>'
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
      console.log("yeh hai de ki response ki json body" +SourceListDEResult);
      SourceListDEResult = JSON.parse(SourceListDEResult);
      var ResultList  = SourceListDEResult.soapEnvelope.soapBody.RetrieveResponseMsg.Results;
         //console.log("Result list " + JSON.stringify(ResultList)); 
         var targetDEArray = {};
         
         for (var key in ResultList) 
        {
         console.log("Data Extension " + ResultList[key].Name)   
         console.log("Data Extension key " + ResultList[key].CustomerKey)   
         targetDEArray[ResultList[key].CustomerKey]= ResultList[key].Name ; 
      //   targetDEArray.push(ResultList[key].Name);
       //   ResultListMap[ResultList[key].Name] = ResultList[key] ; 
        }
        console.log("targetDEArray    :   " +  targetDEArray);
     
        resCall.json({targetDEArray : targetDEArray});
     });
    
   });

   app.post("/fields", async (reqCall,resCall)=>
   {
    console.log("yeh app.post fields wale me hai token " + access_token);
    var body2='<?xml version="1.0" encoding="UTF-8"?>\r\n<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">\r\n    <s:Header>\r\n        <a:Action s:mustUnderstand="1">Retrieve</a:Action>\r\n        <a:MessageID>urn:uuid:7e0cca04-57bd-4481-864c-6ea8039d2ea0</a:MessageID>\r\n        <a:ReplyTo>\r\n            <a:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:Address>\r\n        </a:ReplyTo>\r\n        <a:To s:mustUnderstand="1">https://mc6vgk-sxj9p08pqwxqz9hw9-4my.soap.marketingcloudapis.com/Service.asmx</a:To>\r\n        <fueloauth xmlns="http://exacttarget.com">' + access_token + '</fueloauth>\r\n    </s:Header>\r\n    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\r\n        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">\r\n            <RetrieveRequest>\r\n                <ObjectType>DataExtensionField</ObjectType>\r\n                <Properties>Client.ID</Properties>\r\n                <Properties>CreatedDate</Properties>\r\n                <Properties>CustomerKey</Properties>\r\n                <Properties>DataExtension.CustomerKey</Properties>\r\n                <Properties>DefaultValue</Properties>\r\n                <Properties>FieldType</Properties>\r\n                <Properties>IsPrimaryKey</Properties>\r\n                <Properties>IsRequired</Properties>\r\n                <Properties>MaxLength</Properties>\r\n                <Properties>ModifiedDate</Properties>\r\n                <Properties>Name</Properties>\r\n                <Properties>ObjectID</Properties>\r\n                <Properties>Ordinal</Properties>\r\n                <Properties>Scale</Properties>\r\n\r\n                               <QueryAllAccounts>true</QueryAllAccounts>\r\n                <Retrieves />\r\n                <Options>\r\n                    <SaveOptions />\r\n                    <IncludeObjects>true</IncludeObjects>\r\n                </Options>\r\n            </RetrieveRequest>\r\n      </RetrieveRequestMsg>\r\n   </s:Body>\r\n</s:Envelope>'
    var options = {
      'method': 'POST',
      'url': 'https://mc6vgk-sxj9p08pqwxqz9hw9-4my.soap.marketingcloudapis.com/Service.asmx',
      'headers': {
        'Content-Type': 'text/xml',
        'SoapAction': 'Retrieve'
      },
      body:body2 
     
    };
    request(options, function (error, response)  {
      if (error) throw new Error(error);
       
      SourceDEFieldsResult = response.body;
     

        xml2jsParser.parseString(SourceDEFieldsResult, function (err, result) {
         console.log('mera result : ' + JSON.stringify(result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results']));
          SourceDEFieldsResult = result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'];
        });

       for (var key in SourceDEFieldsResult) {
          
           DEListMap[SourceDEFieldsResult[key].DataExtension.CustomerKey] = {
              "FieldName": SourceDEFieldsResult[key].Name,
              "FieldIsRequired": SourceDEFieldsResult[key].IsRequired,
              "FieldIsPrimaryKey": SourceDEFieldsResult[key].IsPrimaryKey,
              "FieldFieldType": SourceDEFieldsResult[key].FieldType,
              "FieldMaxLength": SourceDEFieldsResult[key].MaxLength,
              "FieldScale": SourceDEFieldsResult[key].Scale,
              "FieldDefaultValue": SourceDEFieldsResult[key].DefaultValue
            };
          
        }

        console.log("DEListMap" + DEListMap) ; 
    



   });



/*
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
     console.log("yeh hai de ki response ki json body" +SourceListDEResult);
     SourceListDEResult = JSON.parse(SourceListDEResult);
     var ResultList  = SourceListDEResult.soapEnvelope.soapBody.RetrieveResponseMsg.Results;
        //console.log("Result list " + JSON.stringify(ResultList)); 
        var targetDEArray = [];
        
        for (var key in ResultList) 
       {
        console.log("Data Extension " + ResultList[key].Name)   
         targetDEArray.push(ResultList[key].Name);
      //   ResultListMap[ResultList[key].Name] = ResultList[key] ; 
       }
     
    });
    
  

   

   
  
  
   }


*/

  
  
 //  fun1();
   
 //  res.sendFile(path.join(__dirname + '/secondpage.html'));

});


async function getacesstoken(ClientIdDestination,ClientSecretDestination,GrantTypeDestination)
  {
    try
      {
        return new Promise(function (resolve, reject) {
        axios.post('https://mc6vgk-sxj9p08pqwxqz9hw9-4my.auth.marketingcloudapis.com/v2/token',
          {
            'client_id': ClientIdDestination,
            'client_secret': ClientSecretDestination,
            'grant_type': GrantTypeDestination,
          //  'account_id':  AccountIdDestination
          })
          .then( (response) => 
            { 
              var result = response.data; 
              //console.log("Result"+result.access_token);
              //console.log('Processing acess token'); 
              resolve(result.access_token); 
            }, 
          (error) => 
            { 
              reject(error); 
            })                    

        }); 
      }
    catch(err){}    
  }




});



  
  



  // start the server listening for requests
app.listen(process.env.PORT || 3000, 
	() => console.log("Server is running."));
