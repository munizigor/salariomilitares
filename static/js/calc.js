//Formulas Gerais

//TODO: Criar Object Verbas para armazenar e acessar todos os valores
function Verbas(){
    this.remuneracao_fixa = function() {
        return (this.soldo + this.apg + this.ats + this.compl_soldo + this.aom + this.gfr +
                this.acp + this.gcef + this.vpe + this.grv)
    }
    this.remuneracao_total = function() {
        return (this.remuneracao_fixa() + this.gfne + this.pttc + this.gsv)
    }
}

function getMes (coluna) {
    return document.getElementById('mes').cells[coluna].headers
}
//Formula para calcular as parcelas do posto
function valor_parcela (rubrica) {
    try {
        if (!isNaN(remuneracao[rubrica])) {
            return remuneracao[rubrica]
        }
        else {
            return remuneracao[document.getElementById('posto').value][rubrica]
        }
    }
    catch(err) {
        console.log(err.message);
    }
}
function parseMoney (x,format=true) {
    if (isNaN(x)) {
        return ''
    }
    else if (format=false){

    }
    else{
        return 'R$ '+ x.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})
    }
}

function preencher_celula(id,col,valor){
//    window['verbas'+col].id=valor TODO: aplicar verbas
    document.getElementById(id).cells[col].innerHTML = parseMoney (valor)
}

function rounddown(x) {
    return Math.floor(x*100)/100
}

var loop_cols = function (fn){
        return function () {
            for (col=1;col<document.getElementById('mes').cells.length;col++){
                try {
                    fn.call(this,col);
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
    }
}
//TODO: Envelopar funcoes de calculo dentro do loop_cols, como um decorator

//Formula base de calculo das parcelas vinculadas ao posto/graduacao
function calcular_rubricas (col){

        mes = getMes(col)
        salario_row = document.getElementById('salario').rows
        for (row=0;row<salario_row.length;row++){
            if (salario_row[row].hasAttribute('id')){
                rubrica = valor_parcela (salario_row[row].id)
                celula = salario_row[row].cells[col]
                if (typeof(rubrica)=='object' && !isNaN(rubrica[mes])) {
                    preencher_celula(salario_row[row].id,col,rubrica[mes])
//                    celula.innerHTML = parseMoney (rubrica[mes])
                }
                else if (!isNaN(rubrica)) {
//                    celula.innerHTML = parseMoney (rubrica)
                    preencher_celula(salario_row[row].id,col,rubrica)
                }
                else {
                    celula.innerHTML = 'NÃO CALCULADO' //TODO Manter por enquanto para identificar erros. trocar depois por parseMoney (0)
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
        else{
            preencher_celula('compl_soldo',col,0)
        }
//      Calcular Fundo de Saúde
        preencher_celula('fundo_saude',col,rounddown(valor_parcela('soldo')*0.02))
//      Calcular Auxílio Moradia
        calc_aux_mor()
        calc_ats()
        calc_acp()
        calc_aux_alim()
//        calc_gfne()
}

function calc_ats() {
    pct_ats = document.getElementById('pct_ats').value
    if (isNaN(pct_ats)) {
        alert('Informe um valor numérico')
        document.getElementById('pct_ats').value = ''
    }
    else {
        ats = rounddown(valor_parcela('soldo')*(parseInt(pct_ats)/100))
        preencher_celula('ats',col,ats)
    }
}

function calc_acp() {
    ind = document.getElementsByClassName("acp")
    pct_acp=0;
    for (count=0;count<ind.length;count++) {
    if (ind[count].checked) {
        pct_acp+= parseInt(ind[count].value)
    }
    }
    acp = rounddown(valor_parcela('soldo')*(parseInt(pct_acp)/100))
    preencher_celula('acp',col,acp)
}

function calc_gfne() {
    pct_gfne = gfne[document.getElementById('tipo_gfne').value]
    valor_gnfe = parseFloat((remuneracao['CORONEL']['soldo']*pct_gfne).toFixed(2))
    preencher_celula('gfne',col,valor_gnfe)
}

function calc_pttc() {
    if (document.getElementById('bool_pttc').value=='sim') {

    }
}

function calc_gsv() {
}

function calc_aux_mor() {
    moradia = document.getElementById('aux_moradia_dependente').value
    preencher_celula('aux_mor',col,valor_parcela (moradia))
}

function calc_aux_alim(){
    if (document.getElementById('situacao_funcional').value=='ativo' || document.getElementById('bool_pttc').value=='sim') {
        preencher_celula('alim',col,valor_parcela ('alim'))
    }
    else{
        preencher_celula('alim',col,0)
    }
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

//Cálculo de parâmetros a partir dos inputs que possuem vários efeitos

function run_sit_func () {
    calc_aux_alim()
}

function run_pttc () {
    calc_aux_alim()
    calc_pttc()
}

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
            entradas = elementos[i].querySelectorAll('.form-control,.form-check-input')
            for (j=0;j<entradas.length;j++) {
                if (entradas[j].classList.contains('form-check-input')) {
                    entradas[j].checked=false
                }
                else {
                    entradas[j].value=''
                }
            }
        }
        else {
            elementos[i].removeAttribute("style");
            elementos[i].required = true;
    }
    }
}

//TODO: Quantidades no select de Pre Escolar para Pensao Alimenticia deve ser sempre menor que o de Pre Escolar