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
//        Loop nas colunas
            for (col=1;col<document.getElementById('mes').cells.length;col++){
                try {
                    calcular_rubricas (col)
                    }
                catch(err) {
                    if (this.event.target.value=='' || this.event.target.value=='null') {
                        return
                        break;
                    }
                    else if (document.getElementById('posto').value=='' || document.getElementById('posto').value=='null'){
                        return alert('Informe o Posto/Graduação')
                        break;
                    }
                    else {
                        console.log(err.message);
                        break;
                    }
                }
            }
        })
    }

}
document.addEventListener("DOMContentLoaded", load, false);

//Iniciar tooltips
$(function () {
  $('[data-toggle="tooltip"]').tooltip({template:'<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner" data-html="true"></div></div>'})
})
