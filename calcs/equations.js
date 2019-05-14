exports.isLead = function( item, lead ){
    return (
        lead.usoDescrip.includes(item.uso_descrip) && 
        item.WIDTH >= 7 &&
        item.PREDIO_CONST < 60 &&
        lead.catCaracterist.includes(item.CAT_caracterist) &&
        item.PRED_CONDO ==""
    ) || (
        lead.usoDescrip.includes(item.uso_descrip) && 
        item.WIDTH >= 7 &&
        item.PREDIO_NIVE <= 3 &&
        item.PREDIO_EDAD >= 50 &&
        lead.catCaracterist.includes(item.CAT_caracterist) &&
        item.PRED_CONDO ==""
    );
}

exports.calculos = function ( item ) {

    var width = item.WIDTH;
    //Columnas de camas
    var cama_col = 0;
    switch (true) {
        case (width < 7 ):
            cama_col = 0;
            break;
        case (width >= 7 && width < 8):
            cama_col = 1;
            break;
        case (width >= 8 && width < 10):
            cama_col = 1.5;
            break;
        case (width >= 10 && width < 15):
            cama_col = 2.25;
            break;
        case (width >= 15 && width < 20):
            cama_col = 3.25;
            break;
        case (width >= 20 && width < 25):
            cama_col = 4;
            break;
        case (width >= 25 && width < 30):
            cama_col = 5;
            break;
        case (width >= 30 && width < 35):
            cama_col = 5.75;
            break;
        case (width >= 35 && width < 40):
            cama_col = 6.75;
            break;
        default:
            cama_col = 7.5
            break;
    };

    // Profundidad neta
    var L_NETA = ( item.PREDIO_TERR * (1-item.AREA_LIBRE / 100) ) / item.WIDTH;

    // Renglones de camas
    var cama_row = Math.floor( L_NETA / 3.25 );

    // Camas totales
    var cama_tot = Math.round( cama_col * cama_row );

    // Renta
    var renta = cama_tot * parseFloat(item.fact_rent) * 
                parseFloat(item.niveles) *40;	

    return {
        cama_col: cama_col,
        L_NETA: L_NETA,
        cama_row: cama_row,
        cama_tot: cama_tot,
        renta: renta
    }
}