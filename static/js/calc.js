//Formulas Gerais
function getMes (coluna) {
    return document.getElementById('mes').cells[coluna].headers
}
function valor_parcela (rubrica) {
    if (!isNaN(remuneracao[rubrica])) {
        return remuneracao[rubrica]
    }
    else {
        return remuneracao[document.getElementById('posto').value][rubrica]
    }
}
function parseMoney (x) {
    return 'R$ '+ x.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})
}

function preencher_celula(id,col,valor){
    document.getElementById(id).cells[col].innerHTML = parseMoney (valor)
}

function rounddown(x) {
    return Math.floor(x*100)/100
}

//function loop_cols(funcao){
//    for (col=1;col<document.getElementById('mes').cells.length;col++){
//        funcao
//    }
//}
//TODO: Envelopar funcoes de calculo dentro do loop_cols, como um decorator

//Formula base de calculo das parcelas vinculadas ao posto/graduacao
function calcular_rubricas (){

    for (col=1;col<document.getElementById('mes').cells.length;col++){
        mes = getMes(col)
        salario_row = document.getElementById('salario').rows
        for (row=0;row<salario_row.length;row++){
            if (salario_row[row].hasAttribute('id')){
                rubrica = valor_parcela (salario_row[row].id)
                celula = salario_row[row].cells[col]
                if (typeof(rubrica)=='object' && !isNaN(rubrica[mes])) {
                    celula.innerHTML = parseMoney (rubrica[mes])
                }
                else if (!isNaN(rubrica)) {
                    celula.innerHTML = parseMoney (rubrica)
                }
                else {
                    celula.innerHTML = 'NÃO ENCONTRADO' //TODO Manter por enquanto para identificar erros. trocar depois por parseMoney (0)
                }
                //TODO:Chamar outras funções de parcelas específicas
            }
            else {
                continue
            }
        }

//     Calcular complemento de Soldo
        if (salario_minimo[mes]>valor_parcela('soldo')) {
            compl_soldo=salario_minimo[mes]-valor_parcela('soldo')
            preencher_celula('compl_soldo',col,compl_soldo)
                    }
//Calcular Fundo de Saúde
        preencher_celula('fundo_saude',col,rounddown(valor_parcela('soldo')*0.02))
    }
}

function calc_ats() {
}

function calc_acp() {
}

function calc_gfne() {
}

function calc_pttc() {
}

function calc_gsv() {
}

function calc_aux_mor() {
}

function calc_pre_esc() {
//TODO: Calcular Pré-Escolar e Cota
}

function calc_pensao_alim() {
//TODO: Calcular Pensao Alimentícia e Pensao sobre pré escolar
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