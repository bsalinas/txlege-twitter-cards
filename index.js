var data = require('./sample.json');
var express = require('express');
var handlebars = require('express-handlebars')

var app = express()
var port = process.env.PORT || 3000;

app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');

//Temporary in-memory storage of a small sample of data.
var billsById = {}
for(var idx in data)
{
    var linkArray = data[idx]['link']
    if(linkArray.length > 0)
    {
        var link = linkArray[0]
        var components = link.split("billtext/html/")
        if(components.length > 0)
        {
            var billNumber = components[1].substring(0,components[1].length-5)
            console.log(data[idx]);
            var session = "";
            var sessionComponents = link.split("tlodocs/");
            if(sessionComponents.length > 0)
            {
                session = sessionComponents[1].split("/")[0];
            }

            billsById[billNumber] = {
                id:billNumber,
                title:data[idx]['title'],
                text:data[idx]['description'],
                author:data[idx]['creator']['__text'],
                link:data[idx]['guid'],
                session:session
            }
            console.log(billsById[billNumber])
        }
    }
}

app.get('/session/:sessionId/bill/:billId', function (req, res) {

  //Grab our parameters from the URL.
  var billId = req.params['billId'];
  var sessionId = req.params['sessionId'];

  var userAgent = req.headers['user-agent']
  if(userAgent.toLowerCase().includes('twitterbot'))
  {
    //If it is twitter, we need to lookup the bill and make some metadata
    if(typeof billsById[billId] != "undefined")
    {
      //This is where we'd make an API call
      //Or a call to a database
      var bill = billsById[billId];
      res.render('twitter', {bill:bill})
      return;
    } 
  }
  //If it isn't twitter knocking on the door, just redirect to the Legislature Website.
  //The alternative would be to make a webpage dedicated to each bill, but who has time for that.
  res.redirect('http://www.legis.state.tx.us/BillLookup/History.aspx?LegSess='+sessionId+'&Bill='+billId);
  
});

//Start the app.
app.listen(port);

