var express = require('express');
var router = express.Router();
var buildings = require('../models/buildings.js');
var equ = require('../calcs/equations.js');
var base64 = require('./base64.js');


var fs = require('fs');
var pdf = require('html-pdf');
var options = { 
    "format": "Legal",
    "border": {
        "top": "1.5cm",
        "right": "2cm",
        "bottom": "1cm",
        "left": "2cm"
      },
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
            var renta75 = Math.round(resp.calculos.renta*75/100).toLocaleString('en');
            var renta15 = Math.round(resp.calculos.renta*15/100).toLocaleString('en');
            var rentaC = Math.round(resp.calculos.renta*20/100/ 1.3 ).toLocaleString('en');

            // Calculate hoy many clients
            var d = new Date();
            var d30 = new Date();
            d30.setDate(d.getDate()+30);
            var clientes = ((d.getMonth() +1) * 6) + (d.getFullYear() - 2019) * 6 * 12 - 19 ;
            var fileName = catastro + ".pdf";

            var url_base = "https://prod.api.hihab.com/proposals/"
            var url_assets = "https://prod.api.hihab.com/assets/"

            // PDF creation
            var html =
            "<html>\
            <header>\
                <link href='<link href='https://fonts.googleapis.com/css?family=Playfair+Display:400,900i' \
                rel='stylesheet'>\
                <style>\
                    body, html { \
                        padding: 0; \
                        margin: 0; \
                        font-size:11px; \
                        font-weight: 400; \
                        color:#333; \
                        line-height:18px; \
                        font-family: 'Playfair Display', serif; \
                    } \
                    .logo { \
                        text-align:center; \
                        width:100%; \
                        border-bottom:1px solid #666; \
                        padding:0; \
                        margin:10px; \
                        margin-left:-20px; \
                    } \
                    .logo img { \
                        width: 150px; \
                        margin-bottom:15px \
                    } \
                    .titulo { \
                        font-weigh:900; \
                        font-size:18px; \
                        text-align:center; \
                        line-height:20px; \
                        font-family:playfair display,georgia,times new roman; \
                        color:black; \
                        margin-bottom: 10px; \
                    } \
                    .sub-titulo { \
                        font-size:14px; \
                        color:black; \
                        width:100%; \
                        text-align:center; \
                    } \
                    .sub-titulo2 { \
                        font-size:18px; \
                        color:black; \
                        width:100%; \
                        text-align:center; \
                        margin-top:8px; \
                        margin-bottom:7px; \
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
                    .colonia { \
                        font-size: 11px; \
                        font-weight: bold; \
                        text-align: center; \
                        margin-top:10px; \
                    } \
                    .review { \
                        font-size: 11px; \
                        padding: 0 10px; \
                        font-style: italic; \
                        text-align:center; \
                    } \
                    .footer { \
                        font-size:8px; \
                        border-top:1px solid #666; \
                        line-height:10px; \
                        padding-top:10px; \
                        text-align:center;'\
                    } \
                    .boton { \
                        background-color: #bf360c; \
                        color: #fff; \
                        text-decoration: none; \
                        padding:5px 15px; \
                    } \
                    .logos { \
                        display: block; \
                        margin-left: auto; \
                        margin-right: auto; \
                        width: 120px; \
                        max-width: 120px; \
                    } \
                </style>\
            </header>\
            <body>" +

// Pág 1
            " <div class='logo'><img src="+url_assets+"logohihab.png></div> \
                <div class='titulo'><b>Oferta no vinculante para arrendamiento de inmueble</b></div> \
                <div class= 'sub-titulo'> \
                    PARA "+calle+", "+no_externo+" POR UN MONTO DE <span style='font-size:16px;'><b> $"+renta+".00 </b>\
                    </span>MENSUAL</div> \
                <br> \
                <span >Estimado(a) <b><i>"+name+"</i></b>,</span><br><br>\
                Es nuestro placer ofrecerle un contrato de arrendamiento por el inmueble ubicado en: \
                <b><i>"+direccion+"</i></b>.<br><br> \
                Nuestra propuesta de arrendamiento es la siguiente:<br> <br>\
                <ul style='list-style-type: none;padding: 0;margin: 0;'> \
                    <li style='background: url("+url_assets+"checked.svg) no-repeat left top; \
                                padding-left: 24px;padding-top: -8px;background-size:16px;'>\
                        Renta mensual fija igual a $"+renta75+".00  \
                    </li> \
                    <li style='background: url("+url_assets+"checked.svg) no-repeat left top; \
                                padding-left: 24px;padding-top: -8px;background-size:16px;'>\
                        Renta mensual variable igual al 20% de la facturación mensual, estimada en \
                        $"+renta+".00, lo que sea mayor de la fija o variable \
                    </li> \
                    <li style='background: url("+url_assets+"checked.svg) no-repeat left top; \
                               padding-left: 24px;padding-top: -8px;background-size:16px;'>\
                        Plazo de arrendamiento de hasta 20 años. \
                    </li> \
                    <li style='background: url("+url_assets+"checked.svg) no-repeat left top; \
                               padding-left: 24px;padding-top: -8px;background-size:16px;'>\
                        1 mes de depósito en firma de contrato de arrendamiento. \
                    </li> \
                </ul> \
                <br>La actividad que se llevará a cabo en dicho lote será el montaje de una \
                <i><strong>Comunidad hi:hab</strong></i> en la modalidad casa-habitación. \
                Rentamos habitaciones privadas a jóvenes profesionistas que laboran en los corporativos \
                ubicados en ese mismo barrio.<br><br> \
                Ya son <b><i>"+clientes+"</i></b> dueños de lotes/casas como usted que se han sumado a nuestra \
                red de ubicaciones en la Ciudad de México. Deseamos que usted y su familia se sumen y gocen de \
                inmediato los beneficios que le ofrece <b><i>hi:hab</i></b>.<br><br> \
                Quedamos a sus órdenes para presentar el contrato de arrendamiento vía  llamada telefónica  ó en \
                persona. Desde nuestra página usted puede agendar una cita de 20 min. con nuestro especialista. \
                <br><br><br>\
                <div style='width:100%;text-align:center;'> \
                    <a style='background-color: #bf360c;color: #fff;text-decoration: none;padding:10px 15px;' \
                        href='https://calendly.com/hihabpropietariolote/llamada-con-hi-hab?month='target='_blank' > \
                        <b>Agenda una cita</b> \
                    </a> \
                </div><br> \
                Reciba un cordial saludo, <br><br> \
                <table style='width:100%'><tr> \
                <td style='text-align:center;font-size:10px;'><img width='100px' height='60px' src="+url_assets+
                    "sign_cuau.png"+"> \
                    <br>Cuauhtémoc Pérez Medina \
                    <br>Presidente y Director General \
                </td> \
                <td style='text-align:center;font-size:10px;'><img width='100px' height='60px' src="+url_assets+
                    "sign_hugo.png"+"> \
                    <br>Hugo A. Medina Rivera \
                    <br>Director de Expansión \
                </td> \
                </tr></table><br><br> \
                <div class = 'footer'> \
                    Varsovia 36, Col. Juarez, Del. Cuauhtémoc, CDMX - Tel. +52(1)86196263 - email: info@hihab.com <br> \
                    <b>Fecha de Descarga: "+d.getDate()+"/"+d.getMonth()+"/"+d.getFullYear()+
                    " Vigencia: "+d30.getDate()+"/"+d30.getMonth()+"/"+d30.getFullYear()+" (30 días)</b> \
                    <br><span style='font-size:6px;margin-top:5px;'>La oferta contenida en el presente documento no es \
                    vinculante para Tecnologías en Urbanismo Metropolitano, S.A. de C.V. <b>hi:hab</b> ni para \
                    cualquiera de sus subsidiarias, filiales, directores o empleados, por lo que en todo caso \
                    <b>hi:hab</b> y el legítimo propietario del Inmueble deberán de celebrar los convenios de \
                    arrendamiento correspondientes para formalizar las obligaciones que asumirán las partes.</span> \
                </div>" +
// Pág 2
                "<div class='logo' style='page-break-before: always;'><img src="+url_assets+"logohihab.png></div> \
                <div class='titulo' style='text-align:left;' ><b>hi:hab es una empresa de tecnología en el sector \
                inmobiliario</b></div> \
                <div><b><i>hi:hab</i></b> diseña, produce y opera comunidades habitacionales en renta, utilizando un \
                sistema constructivo prefabricado, modular y montable/desmontable en 120 días. </div><br><br> \
                <div style='font-size:14px;text-align:left'><b>Comunidades diseñadas por y para el mercado de hoy</b> \
                <br><br></div> \
                Atendemos al jóven profesionista solter@ que labora en los corporativos de CDMX. Desea vivir a \
                una distancia caminable de su oficina, por un precio inteligente y en un hogar de altísima calidad. \
                En la Ciudad de México ya son más de <b><i>2,000</i></b> que han solicitado su Comunidad \
                <b><i>hi:hab</b></i>.<br> \
                <img width='100%' src='"+url_assets+"colage.jpg'"+" style='margin-top:20px;margin-bottom:30px'><br> \
                <div style='font-size:14px;text-align:left'><b>Conoce a nuestros inquilinos</b></div><br> \
                <table style='width:100%'><tr style='vertical-align:top;'> \
                    <td style='width:33%'> \
                        <img src="+url_assets+"karen2.jpg"+" class='image-centered' > \
                        <div class='client'>Karen, 26, nutrióloga en Hospital Español, Polanco</div> \
                        <div class='review'>“Única opción para vivir cerca de mi trabajo que me alcanza”</div> \
                    </div></td> \
                    <td style='width:33%'> \
                        <img src="+url_assets+"ricardo2.jpg"+" class='image-centered' > \
                        <div class='client' style='margin-bottom:12px;'>Ricardo, 30, financiero en Bancomer, Reforma</div> \
                        <div class='review'>“hi:hab ofrece un precio, ubicación, conveniencia y diseño que no existían” \
                        </div> \
                    </div></td> \
                    <td style='width:33%'> \
                        <img src="+url_assets+"laura2.jpg"+" class='image-centered' > \
                        <div class='client' style='margin-bottom:12px;'>Laura, 29, mercadóloga en Coca cola, Polanco</div> \
                        <div class='review'>“Vivir en hi:hab es un upgrade tremendo comparado con mi vivienda actual” \
                        </div> \
                    </div></td> \
                </tr></table> \
                <br><br> \
                <div class = 'footer'> \
                    Varsovia 36, Col. Juarez, Del. Cuauhtémoc, CDMX - Tel. +52(1)86196263 - email: info@hihab.com <br> \
                    <b>Fecha de Descarga: "+d.getDate()+"/"+d.getMonth()+"/"+d.getFullYear()+
                    " Vigencia: "+d30.getDate()+"/"+d30.getMonth()+"/"+d30.getFullYear()+" (30 días)</b> \
                </div>" +
// Pág 3
                "<div class='logo' style='page-break-before: always;'><img src="+url_assets+"logohihab.png></div> \
                <br><div class='titulo'><b>Conoce nuestras ubicaciones</b></div> \
                <div style='font-size:14px;text-align:left'><b>Contamos con tres comunidades en desarrollo</b> \
                <br><br></div> \
                <table style='width:100%'><tr style='vertical-align:top;'> \
                    <td style='width:33%'> \
                        <img src="+url_assets+"moliere.jpg"+" class='image-centered' style='height:113px;'> \
                        <div class='colonia'>Col. Polanco Sección II</div> \
                        <div class='client'>Maria Teresa, 71. Tres hijos y 6 nietos.</div> \
                        <div class='review'>“La mejora en ingresos mensuales fue importante, y permitió conservar el \
                        patrimonio.”</div> \
                    </div></td> \
                    <td style='width:33%'> \
                        <img src="+url_assets+"anzures.jpg"+" class='image-centered' > \
                        <div class='colonia'>Col. Anzures</div> \
                        <div class='client'>Roberto, 42. Tres hermanos.</div> \
                        <div class='review'>“Buscamos un mejor negocio de renta y de largo plazo.”</div> \
                    </div></td> \
                    <td style='width:33%'> \
                        <img src="+url_assets+"granada2.jpg"+" class='image-centered' > \
                        <div class='colonia'>Col. Granada</div> \
                        <div class='client' style='margin-bottom:12px;'>Rogelio. 56. Albacea.</div> \
                        <div class='review'>“Nos ayudó a lograr nuestros planes patrimoniales y de sucesión.” \
                        </div> \
                    </div></td> \
                </tr></table><br><br> \
                <div style='font-size:14px;text-align:left'><b>Escucha lo que en medios se dice de nosotros:</b> \
                <br><br></div> \
                <table style='width:100%'><tr> \
                    <td style='width:33%; text-align:center'> \
                        <div class='review'>“La tecnología se adueña de los bienes raíces con proptech”<br><br> \
                        <img style='width:130px;' src='"+url_assets+"logo_fin.png' > \
                    </div></td> \
                    <td style='width:33%; text-align:center'> \
                        <div class='review'>“Las startups que apuntalan la nueva era inmobiliaria”<br><br>  \
                        <img style='width:130px;' src='"+url_assets+"logo_cnn.png' class='logos' > \
                    </div></td> \
                    <td style='width:33%; text-align:center'> \
                        <div class='review'>“Proptech, la digitalización agita el sector inmobiliario.”<br><br> \
                        <img style='width:130px;' src='"+url_assets+"logo_bbva2.png' class='logos' > \
                        </div> \
                    </div></td> \
                </tr></table><br><br> \
                <div style='font-size:14px;text-align:left'><b>Suma tu lote/casa a nuestra red de ubicaciones hoy mismo \
                </b><br><br></div> \
                <div>Agenda una llamada telefónica o cita en persona con nuestro especialista. <div><br><br> \
                <div style='width:100%;text-align:center;'> \
                    <a style='background-color: #bf360c;color: #fff;text-decoration: none;padding:10px 15px;' \
                        href='https://calendly.com/hihabpropietariolote/llamada-con-hi-hab?month='target='_blank' > \
                        <b>Agenda una cita</b> \
                    </a> \
                </div><br> \
                <div class = 'footer' style='margin-top:160px;'> \
                    Varsovia 36, Col. Juarez, Del. Cuauhtémoc, CDMX - Tel. +52(1)86196263 - email: info@hihab.com <br> \
                    <b>Fecha de Descarga: "+d.getDate()+"/"+d.getMonth()+"/"+d.getFullYear()+
                    " Vigencia: "+d30.getDate()+"/"+d30.getMonth()+"/"+d30.getFullYear()+" (30 días)" +
                    
                

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