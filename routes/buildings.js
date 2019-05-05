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

    var found = true;
    var errorMsg = "";

    // The address provided doesn't have a number
    if ( numArray.length == 0) {
        var found = false;
        var errorMsg = "Without number";
    }

    // The address provided is too short 
    if ( keyArray.length <= 2 ) {
        var found = false;
        var errorMsg = "Too short";
    }

    var resp={
      _id: null,
      encontrado:found,
      lead:false,
      clave_catastral:"",
      uso_suelo:"",
      superficie_terreno:0,
      superficie_construccion:0,
      frente_lote:0,
      errorMsg: errorMsg,
      direccion: req.body.direccion,
      test: {
        direccion: address,
        addrArray: addrArray,
        numArray: numArray,
        keyArray: keyArray
      }
      
    };
  
    
        
    res.json(resp);
    

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