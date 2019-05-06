var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var buildings = require('../models/buildings.js');

/* GET states */

router.get('/', function(req, res) {

    buildings.find().limit(10).exec( function (errAct, activity) {
      if (errAct) return next(errAct);
      res.json(activity);
    });
});

// Search address
router.post('/search', function(req, res, next) {

    // Initializing the response
    var resp={
        _id: null,
        encontrado:true,
        lead:false,
        clave_catastral:"",
        uso_suelo:"",
        superficie_terreno:0,
        superficie_construccion:0,
        frente_lote:0,
        errorMsg: "",
        direccion: "",
        test: {
          direccion: "",
          addrArray: "",
          numArray: "",
          keyArray: ""
        }
        
    };

    let cleanSigns = (function(){
        let de = 'ÁÃÀÄÂÉËÈÊÍÏÌÎÓÖÒÔÚÜÙÛÑÇáãàäâéëèêíïìîóöòôúüùûñç',
             a = 'AAAAAEEEEIIIIOOOOUUUUNCaaaaaeeeeiiiioooouuuunc',
            re = new RegExp('['+de+']' , 'ug');
    
        return texto =>
            texto.replace(
                re, 
                match => a.charAt(de.indexOf(match))
            );
    })();

    // Address cleaning process
    var address = req.body.direccion.toUpperCase(); // Conver to upper case
    address = address.replace(/,/g, " ") // Remove commas and extra spaces
                     .replace(/\s+/g,' ')
                     .trim();
    address = cleanSigns (address); // Normalized address
    var addrArray = address.split(" ");
    var keyArray = [];
    var numArray = [];

    // Fix the array before searching
    for (i=0; i<addrArray.length; i++) {
        s = addrArray[i];
        if ( !isNaN(Number(s)) ) {
            // If s is a number
            numArray.push(s);
        } else {
            if ( s.length >= 3 ) {
                // If s is a string (s>3 eliminates the words: de, la, el)
                keyArray.push(s);
            }
        }
    }

    resp.test = {
        direccion: address,
        addrArray: addrArray,
        numArray: numArray,
        keyArray: keyArray,
        filterByNo: []
    }

    // The address provided doesn't have a number
    if ( numArray.length == 0) {
        resp.found = false;
        resp.errorMsg = "Without number";
        res.json(resp);
    }

    // The address provided is too short 
    if ( keyArray.length <= 1 ) {
        resp.found = false;
        resp.errorMsg = "Too short";
        res.json(resp);
    }

    var weightArray = [];
    // Filter by no_externo
    buildings.find({no_externo: { $in : numArray } }).exec(  (err, items) => {
        if (err) return next(err);
        for (i of items) {
            tm = 0; // Total matched
            nm = 0; // Not matched
            for (k of keyArray) {
                i.calle.includes(k)     ? tm++ : nm++; // Match 'calle' ?
                i.colonia.includes(k)   ? tm++ : nm++; // Match 'colonia' ?
                i.alcaldia.includes(k)  ? tm++ : nm++; // Match 'alcaldia' ?
            };
            weightArray.push({tm: tm, nm: nm, item: i});
        };
        weightArray = weightArray.sort((a, b)=>b.tm - a.tm);// Order Desc by tm
        weightArray = weightArray.filter(function(elem) {
            return elem.tm >= 2;
        });
        resp.test.filterByNo = weightArray;
        res.json(resp);
    });
   

    
    
    
        
    
    

});  

// Edit build
router.post('/edit', function(req, res, next) {

    var id = req.body.id;

    var resp={
      _id: id,
      encontrado:false,
      lead:false,
      clave_catastral:"",
      uso_suelo:"",
      superficie_terreno:0,
      superficie_construccion:0,
      frente_lote:0,
      direccion:{}
    };

    if (id=="5cca24d99e892b21609b4d1c") {
        resp={
            _id: "5cca24d99e892b21609b4d1c",
            encontrado:true,
            lead:true,
            clave_catastral:"031_211_12",
            uso_suelo:"Habitacional Mixto",
            superficie_terreno: req.body.superficie_terreno,
            superficie_construccion: req.body.superficie_construccion,
            frente_lote: req.body.frente_lote,
            direccion:{
                "alcaldia": "MIGUEL HIDALGO",
                "calle": "LEGARIA",
                "colonia": "LOMAS HERMOSA",
                "numero": 586
            }
          };
        res.json(resp);
    } else {
        res.json(resp);
    }

});  

module.exports = router;