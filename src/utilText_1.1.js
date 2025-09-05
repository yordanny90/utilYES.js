/**
 * Repositorio {@link https://github.com/yordanny90/utilYES.js}
 */
(function(){
    var control_char=/[\x80-\x9F]/gu;
    var invalid_textASCII=/[^\s\x20-\x7E]/gu;
    var invalid_text1Byte=/[^\s\x20-\x7E\xA1-\xFF]/gu;
    var invalid_str1Byte=/[^\x00-\xFF]/gu;
    /**
     * Caracteres admitidos por el charset Windows-1252
     * @type {string}
     */
    var win1252_exceptions="\u20ac\u0081\u201a\u0192\u201e\u2026\u2020\u2021\u02c6\u2030\u0160\u2039\u0152\u008d\u017d\u008f\u0090\u2018\u2019\u201c\u201d\u2022\u2013\u2014\u02dc\u2122\u0161\u203a\u0153\u009d\u017e\u0178";
    function translitChar(char){
        return String(char).normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    }

    /**
     * Similar al atributo pattern="[\s\x20-\x7E\xA1-\xFF]*"
     * @param {string} str
     * @param {string|object|null} options Si es string se utiliza como replace. Si es Object se usa como opciones avanzadas:
     * - replace: {string} Default: ''. Reemplaza a los caracteres inválidos
     * - translit: {bool} Habilita la transformación de caracteres inválidos
     * - exceptions: {string} Conjunto de caracteres que nunca se reemplazarán
     * - c_replace: {int} Parametro de salida. Conteo de reemplazos
     * @returns {string}
     */
    function to_1byte(str, options){
        if(typeof options==="string") options={
            replace: options,
        };
        if(!options || typeof options!=="object") options={};
        if(str==null) str='';
        options.translit=!!options.translit;
        if(typeof options.exceptions!=="string") options.exceptions='';
        if(typeof options.replace!=='string') options.replace='';
        options.c_replace=0;
        var nStr=String(str).replace(control_char, '');
        return nStr.replace(invalid_text1Byte,function(char){
            if(win1252_exceptions.includes(char) || options.exceptions.includes(char)) return char;
            if(options.translit){
                var n=translitChar(char).replace(control_char, '');
                if(n.length==1 && n!==char){
                    if(win1252_exceptions.includes(n) || options.exceptions.includes(n)) return n;
                    n=n.replace(invalid_text1Byte, '');
                    if(n.length==1) return n;
                }
            }
            ++options.c_replace;
            return options.replace;
        });
    }

    /**
     * Similar al atributo pattern="[\s\x20-\x7E]*"
     * @param {string} str
     * @param {string|object|null} options Si es string se utiliza como replace. Si es Object se usa como opciones avanzadas:
     * - replace: {string} Default: ''. Reemplaza a los caracteres inválidos
     * - translit: {bool} Habilita la transformación de caracteres inválidos
     * - exceptions: {string} Conjunto de caracteres que nunca se reemplazarán
     * - c_replace: {int} Parametro de salida. Conteo de reemplazos
     * @returns {string}
     */
    function to_ascii(str, options){
        if(typeof options==="string") options={
            replace: options,
        };
        if(!options || typeof options!=="object") options={};
        if(str==null) str='';
        options.translit=!!options.translit;
        if(typeof options.exceptions!=="string") options.exceptions='';
        if(typeof options.replace!=='string') options.replace='';
        options.c_replace=0;
        var nStr=String(str).replace(control_char, '');
        return nStr.replace(invalid_textASCII,function(char){
            if(options.exceptions.includes(char)) return char;
            if(options.translit){
                var n=translitChar(char).replace(control_char, '');
                if(n.length==1 && n!==char){
                    if(options.exceptions.includes(n)) return n;
                    n=n.replace(invalid_textASCII, '');
                    if(n.length==1) return n;
                }
            }
            ++options.c_replace;
            return options.replace;
        });
    }

    /**
     * No genera un error si el json es inválido, en su lugar devuelve un undefined
     * @param {string} json
     * @returns {undefined|any}
     */
    function fromJSON(json){
        try{
            return JSON.parse(json);
        }
        catch(e){
            return undefined;
        }
    }

    /**
     * No genera un error si el object es inválido, en su lugar devuelve un undefined
     * @param {*} object
     * @param {bool} unicode Default: TRUE. Si es FALSE, no escapa los caracteres unicode
     * @returns {undefined|string}
     */
    function toJSON(object, unicode){
        try{
            var r=JSON.stringify(object);
        }
        catch(e){
            return undefined;
        }
        if(unicode==undefined) unicode=true;
        if(unicode){
            try{
                r=r.replace(/[\u0080-\uFFFF]/g, function(match) {
                    return '\\u' + (match.charCodeAt(0).toString(16).padStart(4, '0'));
                });
            }
            catch(e){
            }
        }
        return r;
    }

    /**
     * Objeto para la conversión y filtrado de caracteres no deseados
     */
    window.utilText=Object.assign({
        to_1byte: to_1byte,
        to_ascii: to_ascii,
        toJSON: toJSON,
        fromJSON: fromJSON,
    }, window.utilText);
})();