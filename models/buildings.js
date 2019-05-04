//States

const mongoose = require("mongoose");

var buildings = new mongoose.Schema({
    fid: String,
    width: String,
    alcaldia: String,
    cuenta_cata: String,
    calle: String,
    no_externo: String,
    colonia: String,
    codigo_post: String,
    uso_descrip: String,
    superficie: String,
    densidad_de: String,
    niveles: String,
    altura: String,
    area_libre: String,
    minimo_vivi: String,
    coordenadas: String,
    CAT_caracterist: String,
    CAT_descripcion: String,
    PRED_TERR: String,
    PRED_CONST: String,
    PRED_EDAD: String,
    PRED_NIVE: String,
    PRED_CONDO: String,
    calif25: String,
    Calif50: String,
    calif60: String,
    cama_col: String,
    L_NETA: String,
    cama_row: String,
    cama_tot: String,
    fact_rent: String,
    renta: String
});
module.exports = mongoose.model('buildings', buildings, 'buildings');