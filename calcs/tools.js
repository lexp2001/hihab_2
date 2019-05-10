exports.cleanSigns = (function(){
    let de = 'ÁÃÀÄÂÉËÈÊÍÏÌÎÓÖÒÔÚÜÙÛÑÇáãàäâéëèêíïìîóöòôúüùûñç',
         a = 'AAAAAEEEEIIIIOOOOUUUUNCaaaaaeeeeiiiioooouuuunc',
        re = new RegExp('['+de+']' , 'ug');

    return texto =>
        texto.replace(
            re, 
            match => a.charAt(de.indexOf(match))
        ).toUpperCase()
        .replace(/,/g, " ") // Remove commas and extra spaces
        .replace(/\s+/g,' ')
        .trim();
})();