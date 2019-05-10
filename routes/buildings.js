var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var buildings = require('../models/buildings.js');
var lead = require('../calcs/lead.js');
var equ = require('../calcs/equations.js');
var tools = require('../calcs/tools.js');
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
        pred_edad:0,
        errorMsg: "",
        calculos:{
            renta: "NA"
        },
        direccion: {
            alcaldia: "",
            calle: "",
            colonia: "",
            numero: 0
        }
        
    };

    var address = tools.cleanSigns ( req.body.direccion ); // Normalized address
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
    };

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
            return elem.tm >= 2; // At least 2 match
        });

        if ( weightArray.length > 0){
            item = weightArray[0].item // Item found

            resp.errorMsg= "";
            resp.encontrado = true;
            resp.lead = true;
            resp._id = item._id;
            resp.clave_catastral = item.cuenta_cata;
            resp.uso_suelo = item.uso_descrip;
            resp.superficie_terreno = item.PREDIO_TERR;
            resp.superficie_construccion = item.SUPERFICIE;
            resp.frente_lote = item.WIDTH;
            resp.pred_edad= item.PREDIO_EDAD;
            resp.direccion= {
                alcaldia: item.alcaldia,
                calle: item.calle,
                colonia: item.colonia,
                numero: item.no_externo
            };

            // Is lead?
            resp.lead = equ.isLead(item, lead);

            // Calculating Rent
            resp.calculos = equ.calculos( item );
            if (!resp.lead) {
                resp.calculos.renta = 0;
            }

        } else {
            resp.encontrado = false;
            resp.lead = false;
            resp.errorMsg= "Address doesn't exist";
        }
        res.json(resp);
    });

});  

// Edit build
router.post('/edit', function(req, res, next) {

    var id = req.body.id;

    var resp={
        _id: id,
        encontrado:false,
        lead: false,
        clave_catastral:"",
        uso_suelo:"",
        superficie_terreno:0,
        superficie_construccion:0,
        frente_lote:0,
        pred_edad:0,
        calculos:{},
        direccion:{}
      };

    buildings.findById(id).exec( function (err, item) {
        if (err) return next(err);

        if (item !=null) { 

            resp={
                encontrado:true,
                clave_catastral: item.cuenta_cata,
                lead: false,
                uso_suelo: item.uso_descrip,
                superficie_terreno: req.body.superficie_terreno,
                superficie_construccion: req.body.superficie_construccion,
                frente_lote: req.body.frente_lote,
                pred_edad: item.PREDIO_EDAD,
                calculos:{
                    renta: "NA"
                },
                direccion: {
                    alcaldia: item.alcaldia,
                    calle: item.calle,
                    colonia: item.colonia,
                    numero: item.no_externo
                }
              }; 

            // Is lead?
            item.frente_lote = req.body.frente_lote;
            item.WIDTH = req.body.frente_lote;
            resp.lead = equ.isLead(item, lead);

            // Calculating Rent
            resp.calculos = equ.calculos( item );
            if (!resp.lead) {
                resp.calculos.renta = 0;
            }
        };

        res.json(resp);

    });

}); 

module.exports = router;