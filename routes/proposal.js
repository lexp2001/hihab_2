var express = require('express');
var router = express.Router();

var fs = require('fs');
var pdf = require('html-pdf');
var options = { format: 'Letter' };

/* GET users listing. */
router.post('/', function(req, res, next) {

    var html ="<html>";
    html += "Hola qué talco <b> Leo B</b>";
    html += "</html";

    pdf.create(html, options).toFile('/usr/src/app/public/proposal.pdf', function(err, res) {
        if (err) return console.log(err);
        console.log(res); // { filename: '/app/businesscard.pdf' }
      });

    res.send({
        status:"ok", 
        proposal_url:"https://qa.api.hihab.com/proposal123.pdf"
    });
});

module.exports = router;