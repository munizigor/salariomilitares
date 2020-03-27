for (col=1;col<document.getElementById('mes').cells.length;col++){
    window['verbas'+col] = new Verbas(col)
    window['verbas'+col].lista_metodos = Object.getOwnPropertyNames(window['verbas'+col]).filter(function (p) {
                        return typeof window['verbas'+col][p] === 'function';
                    })
}

function load () {
    elems_name = document.getElementsByName('calcular_rubricas')
    for (var i = 0; i < elems_name.length; i++) {
        action = ((elems_name[i].type=="text")? 'blur' : 'change')
        elems_name[i].addEventListener(action, function () {
            loop_cols();
        })
    }

}
document.addEventListener("DOMContentLoaded", load, false);
