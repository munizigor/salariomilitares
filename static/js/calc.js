function calcular_rubricas (rubrica){

    function getMes (coluna) {
        return document.getElementById('mes').cells[coluna].headers
    }

}
/*
//-Alterar parametro
//-Aciona funcao de calculo de rubricas
//    -SE rubrica é interferida por event.target:
//        Percorrer colunas: for (i=1;i<document.getElementById('mes').cells.length;i++){}
    //            -DE INICIO, se valor campo for =='' ou 'null', atribuir 0 pra não haver erro de cálculo
        //            -Calcular rubrica
        //            -Recalcular todas as rubricas dependentes dela
    //            -Lancar valor nas celulas
//    -Se row tiver TODOS os valores ==0:
        -row.style.display='none';
//    -No mais:
        -row.removeAttribute("style");
*/
function mostrar_campos(event,classe) {
elementos = document.getElementsByClassName(classe)
starter = document.getElementById(event.target.id)
    for (i=0;i<elementos.length;i++) {
        if (
            (event.target.id=='situacao_funcional' && starter.value!=classe) ||
            (starter.value=='null' || parseFloat(starter.value)==0 || starter.value=='')
        ){
            elementos[i].style.display='none';
            elementos[i].required = false;
        }
        else {
            for (i=0;i<elementos.length;i++) {
                elementos[i].removeAttribute("style");
                elementos[i].required = true;
            }
    }
    }
}

//TODO: Quantidades no select de Pre Escolar para Pensao Alimenticia deve ser sempre menor que o de Pre Escolar