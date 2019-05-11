var express = require('express');
var router = express.Router();
var buildings = require('../models/buildings.js');
var equ = require('../calcs/equations.js');

var fs = require('fs');
var pdf = require('html-pdf');
var options = { format: 'Letter' };

/* GET users listing. */
router.post('/', function(req, res, next) {

    var id = req.body.predio.id;
    var name = req.body.user.nombre + " " +  req.body.user.apellido;
    
    var resp = {
        status:"error", 
        proposal_url:"Id doesn't exist"
    };

    buildings.findById(id).exec( function (err, item) {
        if (err) return next(err);

        if (item !=null) { 

            // Building's data
            var direccion = item.calle + ", " + 
                            item.colonia + " # " + 
                            item.no_externo + ", " + 
                            item.colonia + ".";
            var catastro = item.cuenta_cata;
            var anos_const = item.PREDIO_EDAD;
            var uso_descrip = item.uso_descrip;
            var niveles = item.niveles;

            // Get data payload
            var superficie_terreno = req.body.predio.superficie_terreno;
            var frente_lote = Math.round(req.body.predio.frente_lote);
            var superficie_construccion = req.body.predio.superficie_construccion;
            var relacion = req.body.user.relacion;

            // Calculating rental
            item.frente_lote = frente_lote;
            item.WIDTH = frente_lote;

            // Calculating Rent
            resp.calculos = equ.calculos( item );
            var cama_tot = resp.calculos.cama_tot;
            var renta = resp.calculos.renta.toLocaleString('en');
            var rentaC = Math.round(resp.calculos.renta / 1.3 ).toLocaleString('en');

            // PDF creation
            var html =
            "<html><body style='padding:30px 50px;font-size:11px;font-family: Arial, Helvetica, sans-serif; line-height:18px;'>" +
            "<img width='150px;' src='data:image/png;base64,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'><br><br>" +
            "<span style='font-size:13px;'><b>Hola "+name+", gracias por tu interés en hi:hab</span></b><br><br>" +
            "Mi nombre es Hugo y me encargo de las relaciones entre hi:hab y los socios dueños " +
            "de terrenos, nuestro sistema ha corroborado la información de tu lote en: <b>"+direccion+"</b>, " +
            "con Clave de Catastro: <b>"+catastro+"</b>. <br><br>" +

            "En base a nuestros cálculos, la superficie de tu terreno de <b>"+superficie_terreno+"m<sup>2</sup></b>, con un " +
            "frente de: <b>"+frente_lote+"m</b>, que actualmente cuenta con una superficie construida de: " +
            "<b>"+superficie_construccion+"m<sup>2</sup></b> de <b>"+anos_const+" años</b> de construcción, de la cual " +
            "eres <b>"+relacion+"</b>, cuenta con un uso de suelo <b>"+uso_descrip+"</b> y permiso de " +
            "construcción para hasta <b>"+niveles+"</b> niveles por lo que es apta para un desarrollo hi:hab " +
            "de <b>"+cama_tot+" camas</b>.<br><br>" +

            "Por lo mismo calculamos que podemos extenderte una oferta de renta al mes de: <br> <br>" +

            "<table  width=\"100%\" >" +
            "<tbody> <tr style=\"text-align: center;\">" +

            "<td><span style='font-size=13px;line-height:28px;'>" +
            "<strong>"+renta+"</strong></span>" +
            "<strong><span style=\"font-weight: 400;\"><br>" +
            "Oferta hi:hab</span></strong></td>" +

            "<td><h4>Vs</h4></td>" +

            "<td><span style='font-size=13px;line-height:28px;'>" +
            "<strong>"+rentaC+"</strong></span>" +
            "<strong><span style=\"font-weight: 400;\"><br>" +
            "Renta convencional</span></strong></td>" +

            "</tr></tbody></table> <br>" +

            "Calculamos que con nuestro sistema probado de construcción podríamos " +
            "levantar una comunidad hi:hab en tu terreno tan pronto como X meses, y " +
            "tu podrías estar recibiendo ingresos en un plazo de “X tiempo”<br>" +

            "<h4 style='text-align:center;'>Este podría ser tu lote:</h4>" +

            "<div style = 'width:100%;height:100px;background-color:#666'></div>" +

            "<br><div style='width:100%; text-align:right; font-size:11px; line-height:12px;'>" +
            "ATTE<br>" +
            "Hugo Medina<br>" +
            " Director of Real State<br>" +
            "Telefono: 20394809808<br>" +
            "Email: lskdfjlj@hihab.com<br></div>" +
            
            "</body></html";

            var fileName = catastro + ".pdf"
            //var url_base = "http://local.hihab.epicaai.tk/proposals/"
            //var url_base = "https://qa.api.hihab.com/proposals/"
            var url_base = "https://prod.api.hihab.com/proposals/"

            pdf.create(html, options).toFile('/usr/src/app/public/proposals/' + 
                fileName, function(err, res) {
                    if (err) return console.log(err);
                    console.log(res); // { filename: '/app/businesscard.pdf' }
                }
            );

            resp={
                status:"ok", 
                proposal_url:url_base+fileName
            }
        };

        res.send(resp);
    });

    

    
});

module.exports = router;