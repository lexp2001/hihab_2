exports.usoDescrip = 
    [
        "Habitacion Unifamiliar",
        "Habitacion Comercial",
        "Habitacion Plurifamiliar",
        "Habitacion Unifamiliar",
        "Habitacion/Oficinas sin Servicios",
        "Habitacion/Oficinas/Comercio/Servicios",
        "Habitacional",
        "Habitacional (H)",
        "Habitacional con Comercio (HC)",
        "Habitacional con Comercio en Planta Baja",
        "Habitacional con Servicios",
        "Habitacional Mixto",
        "Habitacional Mixto (HM)",
        "Habitacional/Oficinas Sin Servicios"
    ];

exports.catCaracterist =
    [
        "",
        "ACP",
        "ACP/CC",
        "CC"
    ];

//var lead = module.exports = {};
/*
{$and:[{$or:[{"uso_descrip" : "Habitacion Unifamiliar"}, {"uso_descrip" : "Habitacional Mixto"}]}, {WIDTH: {$gte:7}}, {PREDIO_CONST:{$lt:60}},{$or:[{"CAT_caracterist" : ""}, {"CAT_caracterist" : "ACP"}, {"CAT_caracterist" : "ACP/CC"}, {"CAT_caracterist" : "CC"}]}, { PRED_CONDO: "" } ]}

const w = WIDTH;
switch (true) {
    case (W < 5):
        alert("less than five");
        break;
    case (x < 9):
        alert("between 5 and 8");
        break;
    case (x < 12):
        alert("between 9 and 11");
        break;
    default:
        alert("none");
        break;
}

cama_col:
if(   "width"   < 7,
    0, 
    if(   "width"   >= 7 AND    "width"  < 8,
        1, 
        if(   "width"  >= 8 AND   "width"  < 10,
            1.5, 
            if(  "width"   >= 10 AND   "width"  < 15,
                2.25, 
                if(   "width"   >= 15 AND    "width"  < 20,
                    3.25, 
                    if(  "width"   >= 20 AND   "width"  < 25,
                        4, 
                        if(   "width"   >= 25 AND   "width"  < 30,
                            5, 
                            if(   "width"   >= 30 AND   "width"  < 35,
                                5.75, 
                                if(   "width"  >= 35 AND   "width"  < 40,
                                    6.75, 
                                    if(  "width"   >= 40,
                                        7.5,
                                        0))))))))))
*/