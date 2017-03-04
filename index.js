var data = require('./sample.json');
var express = require('express');
var handlebars = require('express-handlebars')

var app = express()
var port = process.env.PORT || 3000;

app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');

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
            var billNumber = components[1].substring(0,components[1].length-4)
            console.log(data[idx]);

            billsById[billNumber] = {
                id:billNumber,
                title:data[idx]['title'],
                text:data[idx]['description'],
                author:data[idx]['creator']['__text'],
                link:data[idx]['guid']
            }
            console.log(billsById[billNumber])
        }
    }
}

app.get('/bill/:billId', function (req, res) {
  // res.send('Hello World! '+ billId)
  console.log(req.headers);
  var billId = req.params['billId'];
  if(typeof billsById[billId] != "undefined")
  {
    var bill = billsById[billId];

    // res.send(bill)
    res.render('twitter', {bill:bill})

  } else {
    res.send("No Bill with id:"+billId)
  }

  
})

app.listen(port, function () {
  console.log('Example app listening on port '+port+'!')
})

