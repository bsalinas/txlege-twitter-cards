var data = require('./sample.json');
var express = require('express');
var handlebars = require('express-handlebars')
var MongoClient = require('mongodb').MongoClient;


var app = express()
var port = process.env.PORT || 3000;

app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');


//Grab all of our DB parameters
var user = process.env.MONGO_USER || ''
var pass = process.env.MONGO_PASS || ''
var host = process.env.MONGO_HOST || 'localhost'
var dbPort = process.env.MONGO_PORT || '27017'
var dbname = process.env.MONGO_DB || ''
var dbString = 'mongodb://'+user+":"+pass+"@"+host+':'+dbPort+'/'+dbname;
var db;

// Initialize connection once
MongoClient.connect(dbString, function (err, database) {
  if(err) throw err;

  db = database;
  // Start the application after the database connection is ready
  app.listen(port);
});


//Temporary in-memory storage of a small sample of data.
// var billsById = {}
// for(var idx in data)
// {
//     var linkArray = data[idx]['link']
//     if(linkArray.length > 0)
//     {
//         var link = linkArray[0]
//         var components = link.split("billtext/html/")
//         if(components.length > 0)
//         {
//             var billNumber = components[1].substring(0,components[1].length-5)
//             // console.log(data[idx]);
//             var session = "";
//             var sessionComponents = link.split("tlodocs/");
//             if(sessionComponents.length > 0)
//             {
//                 session = sessionComponents[1].split("/")[0];
//             }

//             billsById[billNumber] = {
//                 id:billNumber,
//                 title:data[idx]['title'],
//                 text:data[idx]['description'],
//                 author:data[idx]['creator']['__text'],
//                 link:data[idx]['guid'],
//                 session:session
//             }
//             // console.log(billsById[billNumber])
//         }
//     }
// }


app.get('/session/:sessionId/bill/:billId', function (req, res) {

  //Grab our parameters from the URL.
  var billId = req.params['billId'];
  var sessionId = req.params['sessionId'];
  db.collection("bills").findOne({"bill.bill_number":billId, "bill.session.session_id":1429}, function(err, doc){
    // console.log(err);
    if(err){
      res.send(err);
      return;
    }
    console.log(doc);
    if(doc == null){
      res.send("No bill");
      return;
    }
    var author = false;
    for(var idx in doc.bill.sponsors){
      var sponsor = doc.bill.sponsors[idx];
      if(sponsor.sponsor_type_id == 1){
        author = sponsor;
      }
    }
    console.log(author);
    var isSenate = false;
    var districtNumber = false;
    var rawDistrict = author.district;
    console.log(rawDistrict);
    if(typeof rawDistrict != "undefined")
    {
      if(rawDistrict.startsWith('S')){
        isSenate = true;
      }
      else{
        isSenate = false;
      }
      //SD-030
      if(rawDistrict.length >= 3)
      {
        districtNumber = parseInt(rawDistrict.substring(3,rawDistrict.length));
      }
    }
    var district = false;
    var districtUrl = false;
    if(typeof districtNumber != "undefined"){
      district = {
        isSenate:isSenate,
        number:districtNumber
      };
      districtUrl = 'https://s3.amazonaws.com/congressional-maps/tx/'+(isSenate? "upper" : "lower")+'/district_'+districtNumber+'.png'
    }
    console.log("'"+districtUrl+"'");

    res.render('twitter', {bill:doc, author:author, district:district, districtUrl:districtUrl})
  // var userAgent = req.headers['user-agent']
  // if(userAgent.toLowerCase().includes('twitterbot'))
  // {
    //If it is twitter, we need to lookup the bill and make some metadata

    // if(typeof billsById[billId] != "undefined")
  //   {
  //     //This is where we'd make an API call
  //     //Or a call to a database
  //     var bill = billsById[billId];
      // res.render('twitter', {bill:doc, author:author})
  //     return;
  //   } 
  // }
  //If it isn't twitter knocking on the door, just redirect to the Legislature Website.
  //The alternative would be to make a webpage dedicated to each bill, but who has time for that.
  // res.redirect('http://www.legis.state.tx.us/BillLookup/History.aspx?LegSess='+sessionId+'&Bill='+billId);
});
  
});


