//Formulas Gerais

//TODO: Criar Object Verbas para armazenar e acessar todos os valores
function Verbas(col){
//  REMUNERAÇÃO FIXA

    this.compl_soldo = function() {
        if (salario_minimo[mes]>this.soldo) {
            valor_compl_soldo = salario_minimo[mes]-this.soldo
                    }
        else{
            valor_compl_soldo = 0
        }
        return valor_compl_soldo
    }
    this.acp = function() {
        ind = document.getElementsByClassName("acp")
        pct_acp=0;
        for (count=0;count<ind.length;count++) {
        if (ind[count].checked) {
            pct_acp+= parseInt(ind[count].value)
        }
        }
        acp = rounddown(this.soldo*(parseInt(pct_acp)/100))
        return acp
    }
    this.ats = function () {
        pct_ats = document.getElementById('pct_ats').value
        if (isNaN(pct_ats)) {
            alert('Informe um valor numérico')
            ats = 0
        }
        else if (pct_ats=='') {
            ats = 0
        }
        else {
            ats = rounddown(this.soldo*(parseInt(pct_ats)/100))
        }
        return ats
    }
//    REMUNERAÇÃO FLUTUANTE
    this.gfne = function () {
        if (document.getElementById('tipo_gfne').value == false) {
            valor_gnfe = 0
        }
        else {
            pct_gfne = gfne[document.getElementById('tipo_gfne').value]
            valor_gnfe = Math.round((remuneracao['CORONEL']['soldo']*pct_gfne)*100)/100
        }
        return valor_gnfe
    }
    this.pttc = function () {
        if (document.getElementById('bool_pttc').value=='sim') {
            valor_pttc = rounddown((window['verbas'+col].remuneracao_fixa())*0.3)
        }
        else {
            valor_pttc = 0
        }
        return valor_pttc
    }
    this.gsv = function () {
        horas_gsv = (document.getElementById('horas_gsv').value).replace(/,/g, '.')
        if (isNaN(horas_gsv)) {
            alert('Informe um valor numérico')
            gsv = 0
        }
        else if (horas_gsv=='') {
            gsv = 0
        }
        else {
            gsv = ((400/8)*Math.round(horas_gsv))
        }
       return gsv
    }

//    DIREITOS PECUNIÁRIOS

    this.alim = function (){
        if (document.getElementById('situacao_funcional').value=='ativo' || document.getElementById('bool_pttc').value=='sim') {
            valor_alim = valor_parcela ('alim')
        }
        else{
            valor_alim = 0
        }
        return valor_alim
    }
    this.aux_mor = function () {
        if (document.getElementById('aux_moradia_dependente').value==false) {
            valor_aux_mor = 0
        }
        else {
            moradia = document.getElementById('aux_moradia_dependente').value
            valor_aux_mor = valor_parcela (moradia)
        }
        return valor_aux_mor
    }
    this.aux_pe = function () {
        if (document.getElementById('pre_escolar').value == false) {
            valor_pe = 0
        }
        else {
            qtde_pe = document.getElementById('pre_escolar').value
            valor_pe = qtde_pe*valor_parcela ("pre_escolar")
        }
        return valor_pe
    }
//    DESCONTOS
    this.cota_pe = function() {
        return rounddown((this.aux_pe())*0.05)
    }
    this.contr_pensao_militar = function() {
        valor_pmil = rounddown((this.remuneracao_fixa())*pensao_militar[mes])
        return valor_pmil
    }
    this.contr_pensao_militar_adic = function () {
        if (document.getElementById('pensao_militar_adicional').value=='sim') {
            valor_pmad = rounddown((window['verbas'+col].remuneracao_fixa())*0.015)
        }
        else {
            valor_pmad = 0
        }
        return valor_pmad
    }
    this.fundo_saude = function () {
        return rounddown((this.soldo)*0.02)
    }
    this.fundo_saude_adicional = function () {
        if (document.getElementById('dep_fs').value == false) {
            qtde_fsa = 0
        }
        else {
            qtde_fsa = document.getElementById('dep_fs').value
        }
        valor_fsa = parseInt(qtde_fsa)*valor_parcela ("cotafsa")
        return valor_fsa
    }
    this.pensao_alim = function () {
        pct_pa = document.getElementById('percentual_pa').value
        if (isNaN(pct_pa)) {
            alert('Informe um valor numérico')
            pa = 0
        }
        else if (pct_pa=='') {
            pa = 0
        }
        else {
              tipo_pa = document.getElementById('tipo_pa').value
              if (tipo_pa=='sal_minimo') {
                base_calculo = salario_minimo[mes]
              }
              else if (tipo_pa=='liquido') {
              base_calculo = this.remuneracao_total() - this.contr_pensao_militar() //  TODO: - this.irrfAntesDaPA
              }
              else if (tipo_pa=='bruto') {
                base_calculo = this.remuneracao_total()
              }
              else {
                base_calculo = 0
              }
            pa = rounddown(base_calculo*(parseFloat(pct_pa)/100))
        }
        return pa
    }

//    SOMAS
    this.remuneracao_fixa = function() {
        soma = (this.soldo + this.apg + this.ats() + this.compl_soldo() + this.aom + this.gfr +
                this.acp() + this.gcef + this.vpe + this.grv)
        return soma
    }
    this.remuneracao_total = function() {
        soma = (this.remuneracao_fixa() + this.gfne() + this.pttc() + this.gsv())
        return soma
    }
    this.direitos_pecuniarios = function() {
        soma = (this.aux_mor() + this.alim() + this.aux_pe())
        return soma
    }
    this.rendimento_bruto = function() {
        soma = (this.remuneracao_total() + this.direitos_pecuniarios())
        return soma
    }
    this.descontos_total = function() {
        soma = (this.cota_pe() + this.pensao_alim() + this.pensao_alim_pe + this.contr_pensao_militar() +
                this.contr_pensao_militar_adic() + this.fundo_saude() + this.fundo_saude_adicional()  + this.irrf)
        return soma
    }
    this.rendimento_liquido = function() {
        soma = (this.rendimento_bruto() - this.descontos_total())
        return soma
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

    if (typeof(window['verbas'+col][id])==='function') {
        valor = window['verbas'+col][id]()
    }
    else {
        window['verbas'+col][id] = valor
    }
    document.getElementById(id).cells[col].innerHTML = parseMoney (valor)
//  Inserir campos parametrizados como metodos
    metodos = window['verbas'+col]['lista_metodos']
    for (i=0;i<metodos.length;i++) {
        if (document.getElementById(metodos[i])!=null) {
            document.getElementById(metodos[i]).cells[col].innerHTML = parseMoney (window['verbas'+col][metodos[i]]())
        }
    }
}

function rounddown(x) {
    return Math.floor(x*100)/100
}

var loop_cols = function (fn){
//TODO: Loops estao deixando o sistema lento
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
                    valor_final=rubrica[mes]
                }
                else if (!isNaN(rubrica)) {
                    valor_final=rubrica
                }
                else {
                    valor_final = 0 //TODO Manter por enquanto para identificar erros. trocar depois por parseMoney (0)
                }

                preencher_celula(salario_row[row].id,col,valor_final)

            }
            else {
                continue
            }
        }

//TODO:Chamar outras funções de parcelas específicas
//     Calcular complemento de Soldo
//        if (salario_minimo[mes]>valor_parcela('soldo')) {
//            compl_soldo=salario_minimo[mes]-valor_parcela('soldo')
//            preencher_celula('compl_soldo',col,compl_soldo)
//                    }
//        else{
//            preencher_celula('compl_soldo',col,0)
//        }
//      Calcular Fundo de Saúde
//        preencher_celula('fundo_saude',col,rounddown(valor_parcela('soldo')*0.02))
}


//Calculo dos descontos

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

//EventListener de Ativos

//EventListener de Pensao Alimenticia

//TODO: Quantidades no select de Pre Escolar para Pensao Alimenticia deve ser sempre menor que o de Pre Escolar