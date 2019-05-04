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

    var resp={
      _id: null,
      encontrado:false,
      lead:false,
      clave_catastral:"",
      uso_suelo:"",
      superficie_terreno:0,
      superficie_construccion:0,
      frente_lote:0,
      direccion:{}
    };
  
    var address = req.body.direccion;

    if (address=="Calzada Legaria, Lomas Hermosa, 585") {
        resp={
            _id: "5cca24d99e892b21609b4d1c",
            encontrado:true,
            lead:true,
            clave_catastral:"031_211_12",
            uso_suelo:"Habitacional Mixto",
            superficie_terreno:161,
            superficie_construccion:150,
            frente_lote:8.90066091,
            direccion:{
                "alcaldia": "MIGUEL HIDALGO",
                "calle": "LEGARIA",
                "colonia": "LOMAS HERMOSA",
                "numero": 585
            }
          };
    } 

    if (address=="Calzada Legaria, Lomas Hermosa, 586") {
        resp={
            _id: "5cca24d99e892b21609b4d1c",
            encontrado:true,
            lead:false,
            clave_catastral:"031_211_12",
            uso_suelo:"Habitacional Mixto",
            superficie_terreno:161,
            superficie_construccion:150,
            frente_lote:8.90066091,
            direccion:{
                "alcaldia": "MIGUEL HIDALGO",
                "calle": "LEGARIA",
                "colonia": "LOMAS HERMOSA",
                "numero": 586
            }
          };
    } 

    if (address.calle) {

        if (address.calle=="Calzada Legaria, Lomas Hermosa, 585") {
            resp={
                _id: "5cca24d99e892b21609b4d1d",
                encontrado:true,
                lead:true,
                clave_catastral:"031_211_12",
                uso_suelo:"Habitacional Mixto",
                superficie_terreno:161,
                superficie_construccion:150,
                frente_lote:8.90066091,
                direccion:{
                    "alcaldia": "MIGUEL HIDALGO",
                    "calle": "LEGARIA",
                    "colonia": "LOMAS HERMOSA",
                    "numero": 585
                }
              };
        };
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