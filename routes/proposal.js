var express = require('express');
var router = express.Router();
var buildings = require('../models/buildings.js');
var equ = require('../calcs/equations.js');
var base64 = require('./base64.js');


var fs = require('fs');
var pdf = require('html-pdf');
var options = { 
    "height": "13.5in",
    "width": "8in"
};

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
            var calle = item.calle;
            var no_externo = item.no_externo;
            var direccion = calle + ", " + 
                            no_externo + ", COL. " +
                            item.colonia + "  " + 
                            item.codigo_post +
                            ", CIUDAD DE MÉXICO";
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
            var renta = Math.round(resp.calculos.renta).toLocaleString('en');
            var renta20 = Math.round(resp.calculos.renta*20/100).toLocaleString('en');
            var renta15 = Math.round(resp.calculos.renta*15/100).toLocaleString('en');
            var rentaC = Math.round(resp.calculos.renta*20/100/ 1.3 ).toLocaleString('en');

            // Calculate hoy many clients
            var d = new Date();
            var d30 = new Date();
            d30.setDate(d.getDate()+30);
            var clientes = ((d.getMonth() +1) * 6) + (d.getFullYear() - 2019) * 6 * 12 - 19 ;
            var fileName = catastro + ".pdf"
            var url_base = "http://local.hihab.epicaai.tk/proposals/";
            var url_assets = "http://local.hihab.epicaai.tk/assets/"
            //var url_base = "https://qa.api.hihab.com/proposals/"
            //var url_base = "https://prod.api.hihab.com/proposals/"

            // PDF creation
            var html =
            "<html>\
            <header>\
                <link href='<link href='https://fonts.googleapis.com/css?family=Playfair+Display:400,900i' \
                rel='stylesheet'>\
                <style>\
                    .titulo { \
                        font-weigh:900; \
                        font-family:playfair display,georgia,times new roman; \
                        color:black; \
                    } \
                    .sub-titulo { \
                        font-size:14px; \
                        color:black; \
                        width:100%; \
                        text-align:center; \
                    } \
                    .image-centered { \
                        border-radius: 50%; \
                        display: block; \
                        margin-left: auto; \
                        margin-right: auto; \
                        width: 70%; \
                    } \
                    .client { \
                        font-size: 10px; \
                        font-weight: bold; \
                        text-align: center; \
                        padding: 10px; \
                    } \
                    .review { \
                        font-size: 12px; \
                        padding: 0 10px; \
                        font-style: italic; \
                    } \
                </style>\
            </header>\
            <body style='padding:30px 50px;font-size:12px;font-weight: 400;color:#333;line-height:18px; \
                font-family:\"Playfair Display\", serif;'> \
                <div style ='text-align:center;width:100%;border-bottom:1px solid #666;'> \
                <img width='150px;' src="+url_assets+"logohihab.png"+" style='margin-bottom:20px'></div><br> \
                <div style='font-size:24px;width:100%;text-align:center;line-height:28px;'> \
                    <strong><span class='titulo'>Oferta de renta no vinculante</span></strong></div> \
                <div class= 'sub-titulo'> \
                    PARA "+calle+",<span style='font-size:18;'> "+no_externo+" </span> \
                    POR UN MONTO DE $<span style='font-size:18;'>"+renta20+".00</span> / MENSUAL</div> \
                <br> \
                <span >Estimado <b><i>"+name+"</i></b>,</span><br><br>\
                Es nuestro placer ofrecerle un contrato de arrendamiento por el inmueble ubicado en: \
                <b><i>"+direccion+"</i></b>. Nuestra propuesta de arrendamiento es la siguiente:<br> <br>\
                <ul style='list-style-type: none;padding: 0;margin: 0;'> \
                    <li style='background: url("+url_assets+"checked.svg) no-repeat left top; \
                                padding-left: 24px;padding-top: -8px;background-size:16px;'>\
                        Renta mensual fija igual a $"+renta15+".00  \
                    </li> \
                    <li style='background: url("+url_assets+"checked.svg) no-repeat left top; \
                                padding-left: 24px;padding-top: -8px;background-size:16px;'>\
                        Renta mensual variable estimada igual a $"+renta+".00, lo que sea de la fija o variable \
                    </li> \
                    <li style='background: url("+url_assets+"checked.svg) no-repeat left top; \
                               padding-left: 24px;padding-top: -8px;background-size:16px;'>\
                        Plazo de arrendamiento de hasta 20 años. \
                    </li> \
                    <li style='background: url("+url_assets+"checked.svg) no-repeat left top; \
                               padding-left: 24px;padding-top: -8px;background-size:16px;'>\
                        1 mes de depósito en firma de contrato de arrendamiento. \
                    </li> \
                    <li style='background: url("+url_assets+"checked.svg) no-repeat left top; \
                               padding-left: 24px;padding-top: -8px;background-size:16px;'>\
                        1 mes adelantado en entrega de posesión de inmueble. \
                    </li> \
                </ul> \
                <br>La actividad que se llevará a cabo en dicho lote será el montaje de una \
                <b><i>Comunidad hi:hab</i></b> para renta de habitaciones en la modalidad casa-habitación. \
                Rentaremos las habitaciones a los jóvenes profesionistas que laboran en los corporativos \
                ubicados en ese mismo barrio.<br><br> \
                Ya son <b><i>"+clientes+"</i></b> dueños de lotes/casas como ustedes que se han sumado a nuestra \
                red de ubicaciones en la Ciudad de México. Deseamos que usted y su familia se sumen y gocen de \
                inmediato los beneficios que le ofrece <b><i>hi:hab</i></b>.<br><br> \
                Quedamos a sus órdenes para presentar el contrato de arrendamiento vía conferencia ó en persona. \
                Desde nuestra página usted puede agendar una cita de 20 min. con nuestro especialista.<br><br> \
                <div style='width:100%;text-align:center;'> \
                <a href='https://calendly.com/hihabpropietariolote/llamada-con-hi-hab?month=' \
                target=\"_blank\" style='color: #000;text-decoration: none;'><span style='padding:5px 15px; \
                background-color:#b1b1b1;'> \
                Agenda una cita</span></a></div><br> \
                Reciba un cordial saludo, <br> \
                <table style='width:100%'><tr> \
                <td style='text-align:center;font-size:10px;'><img width='100px' height='60px' src="+url_assets+
                    "sign1.png"+"> \
                    <br>Cuauhtémoc Pérez Medina \
                    <br>Presidente y Director General \
                </td> \
                <td style='text-align:center;font-size:10px;'><img width='100px' height='60px' src="+url_assets+
                    "sign2.png"+"> \
                    <br>Hugo A. Medina Rivera \
                    <br>Director de Expansión \
                </td> \
                </tr></table><br><br> \
                <div style='font-size:8px;border-top:1px solid #666;'> \
                    Varsovia 36, Col. Juarez, Del. Cuauhtémoc, CDMX - Tel. +52(1)86196263 - email: info@hihab.com <br> \
                    <b>Fecha de Descarga: "+d.getDate()+"/"+d.getMonth()+"/"+d.getFullYear()+
                    " Vigencia: "+d30.getDate()+"/"+d30.getMonth()+"/"+d30.getFullYear()+" (30 días)</b> \
                </div>\
                <div style ='text-align:center;width:100%;border-bottom:1px solid #666;page-break-before: always;'> \
                    <img width='150px;' src="+url_assets+"logohihab.png"+" style='margin-top:30px;margin-bottom:20px'>\
                </div><br>" +


                "<div style='font-size:24px;width:100%;text-align:center;line-height:28px;'> \
                    <strong><span class='titulo'>¿Quién es Hi:Hab?</span></strong> \
                </div><br> \
                <div class= 'sub-titulo'>Una empresa de tecnología en el sector inmobiliario que diseña, produce \
                    y opera comunidades habitacionales en renta.<br><br> \
                    “Comunidades diseñadas a la medida del mercado de hoy”. \
                </div> \
                <img width='100%;' src="+url_assets+"Pod2.1.jpg"+" style='margin-top:30px;margin-bottom:0px'> \
                <img height='140px;' src="+url_assets+"common.jpg"+" style='margin-top:5px;margin-bottom:20px'> \
                <img height='140px;' src="+url_assets+"services2.jpg"+" style='margin-top:5px;margin-bottom:20px'> \
                Atendemos al jóven profesionista que labora en los corporativos de CDMX. Desean vivir a una distancia \
                caminable de su oficina, por un precio inteligente y en un hogar de altísima calidad. \
                En la Ciudad de México ya son más de <b><i>2,000</i></b> que han solicitado su Comunidad Hi:Hab. \
                <div style='font-size:8px;border-top:1px solid #666;margin-top:80px;'> \
                    Varsovia 36, Col. Juarez, Del. Cuauhtémoc, CDMX - Tel. +52(1)86196263 - email: info@hihab.com <br> \
                    <b>Fecha de Descarga: "+d.getDate()+"/"+d.getMonth()+"/"+d.getFullYear()+
                    " Vigencia: "+d30.getDate()+"/"+d30.getMonth()+"/"+d30.getFullYear()+" (30 días)</b> \
                </div> "+

                "<div style ='text-align:center;width:100%;border-bottom:1px solid #666;page-break-before: always;'> \
                    <img width='150px;' src="+url_assets+"logohihab.png"+" style='margin-top:30px;margin-bottom:20px'>\
                </div><br> \
                <table style='width:100%'><tr> \
                    <td style='width:33%'> \
                        <img src="+url_assets+"karen2.jpg"+" class='image-centered' > \
                        <div class='client'>Karen, 26, nutrióloga en Hospital Español, Polanco</div> \
                        <div class='review'>“Única opción para vivir cerca de mi trabajo que me alcanza”</div> \
                    </div></td> \
                    <td style='width:33%'> \
                        <img src="+url_assets+"ricardo2.jpg"+" class='image-centered' > \
                        <div class='client'>Ricardo, 30, financiero en Bancomer, Reforma</div> \
                        <div class='review'>“hi:hab ofrece un precio, ubicación, conveniencia y diseño que no existían” \
                        </div> \
                    </div></td> \
                    <td style='width:33%'> \
                        <img src="+url_assets+"karen2.jpg"+" class='image-centered' > \
                        <div class='client'>Karen, 26, nutrióloga en Hospital Español, Polanco</div> \
                        <div class='review'>“Única opción para vivir cerca de mi trabajo que me alcanza”</div> \
                    </div></td> \
                </tr></table> \
                " +

            "</body></html";

            

 
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