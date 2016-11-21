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
            index: 'testindex1234',
            type: 'mytype',
            body
        }, function (error, response) {
            // ...
            if (error) throw error;
            console.log("OK")
            resolve(true);
        });
    })
}
function getData(size, mac, type) {
    return new Promise((resolve, reject) => {
        if (mac && type)
            client.search({
                    index: 'testindex1234',
                    size,
                    body: {
                        "query": {
                            "constant_score": {
                                "filter": {
                                    "bool": {
                                        "must": [
                                            {
                                                "match_phrase": {
                                                    "qcl_json_data.deviceDetails.address.value": mac
                                                }
                                            },
                                            /*{
                                             "match_phrase": {
                                             "qcl_json_data.deviceDetails.transmissionTime.value": "2016-11-10 09:43:30"
                                             }
                                             },*/
                                            {
                                                "match_phrase": {
                                                    "qcl_json_data.records.packetType.value": type
                                                }
                                            }
                                        ]

                                    }
                                }
                            }

                            // Set to 30 seconds because we are calling right back

                        }
                    }
                }, (err, res) => {
                    if (err) throw err;
                    resolve(res.hits ? res.hits : {err: true, reason: "err"})
                }
            )
        else {
            resolve([])
        }
    })

}
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});
router.post('/data', (req, res) => {
    console.log(JSON.stringify(req.body));
    var data = req.body;
    data['qcl_json_data'] = JSON.parse(data['qcl_json_data'])
    data.timestamp = new Date();
    createData(data).then(success => {
        res.send(success)
    });
});
router.get('/data', (req, res) => {
    var size = req.query.size || 30;
    var mac = req.query.mac;
    var type = req.query.type;
    getData(size, mac, type).then(data => {
        res.send(data)
    })
})
module.exports = router;
