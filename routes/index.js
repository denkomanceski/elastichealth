var express = require('express');
var router = express.Router();
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'comm.marand.si:9200',
    log: 'trace'
});

// client.ping({
//   // ping usually has a 3000ms timeout
//   requestTimeout: Infinity,

//   // undocumented params are appended to the query string
//   hello: "elasticsearch!"
// }, function (error) {
//   if (error) {
//     console.trace('elasticsearch cluster is down!');
//   } else {
//     console.log('All is well');
//   }
// });
function createData(body) {
    return new Promise((resolve, reject) => {
        client.create({
            index: 'testindex',
            type: 'healthdata',
            body
        }, function (error, response) {
            // ...
            if (error) throw error;
            console.log("OK")
            resolve(true);
        });
    })
}
function getData(size) {
    return new Promise((resolve, reject) => {
        client.search({
            index: 'testindex',
            size
            // Set to 30 seconds because we are calling right back

        }, (err, res) => {
            if(err) throw err;
            resolve(res.hits ? res.hits : {err: true, reason: "err"})
        })
    })

}
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});
router.post('/data', (req, res) => {
    var data = JSON.parse(req.body);
    data.timestamp = new Date();
    createData(data).then(success => {
        res.send(success)
    });
});
router.get('/data', (req, res) => {
    var size = req.query.size || 30;
    getData(size).then(data => {
        res.send(data)
    })
})
module.exports = router;
