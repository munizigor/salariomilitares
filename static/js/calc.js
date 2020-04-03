//Formulas Gerais

function Verbas(col){

//  REMUNERAÇÃO FIXA

    this.valor_parcela = function (rubrica , corporacao) {
//        try {
            if (!isNaN(remuneracao[rubrica])) {
                valor = remuneracao[rubrica]
            }
            else if (document.getElementById('posto').value!=false){
                valor = remuneracao[document.getElementById('posto').value][rubrica]
            }
            valor_final = (corporacao === undefined) ? valor : valor[corporacao]
            return valor_final
//        }
//        catch(err) {
//            console.log(err.message);
//        }
    }
    this.soldo = function() { return this.valor_parcela ("soldo")}
    this.gcef = function() { return this.valor_parcela ("gcef")}
    this.grv = function() { return this.valor_parcela ("grv")}
    this.vpe = function() { return this.valor_parcela ("vpe")}
    this.apg = function() { return this.valor_parcela ("apg")}
    this.aom = function() { return this.valor_parcela ("aom")}
    this.gfr = function() { return this.valor_parcela ("gfr")}
    this.compl_soldo = function() {
        if (salario_minimo[mes]>this.soldo()) {
            valor_compl_soldo = salario_minimo[mes]-this.soldo()
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
        acp = rounddown((this.soldo()*parseFloat(pct_acp))/100)
        return acp
    }
    this.ats = function () {
        pct_ats = document.getElementById('pct_ats').value.replace(/,/g, '.')
        if (isNaN(pct_ats)) {
            alert('Informe um valor numérico')
            ats = 0
        }
        else if (pct_ats=='') {
            ats = 0
        }
        else {
            ats = rounddown(this.soldo()*(parseInt(pct_ats)/100))
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
            valor_gnfe = (remuneracao['CORONEL']['soldo']*pct_gfne)
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
            valor_alim = this.valor_parcela ('alim')
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
            valor_aux_mor = this.valor_parcela (moradia)
        }
        return valor_aux_mor
    }
    this.aux_pe = function () {
        if (document.getElementById('pre_escolar').value == false) {
            valor_pe = 0
        }
        else {
            qtde_pe = document.getElementById('pre_escolar').value
            valor_pe = qtde_pe*this.valor_parcela ("pre_escolar")
        }
        return valor_pe
    }
//    DESCONTOS
    this.cota_pe = function() {
        return rounddown((this.aux_pe())*0.05)
    }
    this.contr_pensao_militar = function() {
        if (getMes(col) == '03/01/2020') {
            valor_pmil = Math.round((this.remuneracao_fixa())*pensao_militar[mes]*100)/100
        }
        else {
            valor_pmil = rounddown((this.remuneracao_fixa())*pensao_militar[mes])
        }
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
        return rounddown((this.soldo())*0.02)
    }
    this.fundo_saude_adicional = function () {
        if (document.getElementById('dep_fs').value == false) {
            qtde_fsa = 0
        }
        else {
            qtde_fsa = document.getElementById('dep_fs').value
        }
        corporacao = document.getElementById('corporacao').value
        valor_fsa = parseInt(qtde_fsa)*this.valor_parcela ("cotafsa",corporacao)
        return valor_fsa
    }
    this.pensao_alim = function (tipo='pensao_alim') {
//    TODO: Verificar em casos especificos e ver como se chega aos valores da ficha
        pct_pa = document.getElementById('percentual_pa').value.replace(/,/g, '.')
        if (isNaN(pct_pa)) {
            alert('Informe um valor numérico')
            pa = 0
        }
        else if (pct_pa=='') {
            pa = 0
        }
        else {
              if (tipo=='pa_decimo_terceiro'){
                parcela_base = this.decimo_terceiro()
              }
              else {
                parcela_base = this.remuneracao_total() - this.contr_pensao_militar() - this.irrf(tipo) - this.reparacao_erario()
              }
              tipo_pa = document.getElementById('tipo_pa').value
              if (tipo_pa=='sal_minimo') {
                base_calculo = salario_minimo[mes]
              }
              else if (tipo_pa=='liquido') {
//              console.log(this.irrf(tipo))
              base_calculo = parcela_base
              }
              else if (tipo_pa=='bruto') {
                base_calculo = this.remuneracao_total() + this.alim() + this.aux_mor()
              }
              else if (tipo_pa=='bruto_com_indenizacoes') {
                base_calculo = parcela_base + this.alim() + this.aux_mor()
              }
              else {
                base_calculo = 0
              }
            pa = rounddown(base_calculo*(parseFloat(pct_pa)/100))
        }
        return pa
    }
    this.pensao_alim_pe = function () {
        if (document.getElementById('pre_escolar_pensao').value == false) {
            valor_pa_sobre_pe = 0
        }
        else {
            qtde_pa_sobre_pe = document.getElementById('pre_escolar_pensao').value
            valor_pa_sobre_pe = qtde_pa_sobre_pe*this.valor_parcela ("pre_escolar")
        }
        return rounddown((valor_pa_sobre_pe)*0.95)
    }
    this.irrf = function (tipo='remuneracao') {
        if (document.getElementById('dep_ir').value == false) {
            qtde_ir = 0
        }
        else {
            qtde_ir = document.getElementById('dep_ir').value
        }
        deducao_dependente = (189.59)*parseInt(qtde_ir)
        descontos = (this.contr_pensao_militar() + this.contr_pensao_militar_adic() + this.fundo_saude() +
        this.fundo_saude_adicional() + this.outros_descontos_dedutiveis() + this.reparacao_erario())
//        Base de Calculo do IRRF mensal Antes da Pensao Alimenticia
        if (tipo =='pensao_alim') {
            base_calculo = this.remuneracao_total() - descontos
        }
//        Base de Calculo do IRRF mensal Final
        if (tipo =='remuneracao') {
            base_calculo = this.remuneracao_total() - descontos - this.pensao_alim()
        }
//        Base de Calculo do 13 Salario
        if (tipo =='decimo_terceiro') {
            base_calculo = this.decimo_terceiro() - this.pa_decimo_terceiro()
        }
//        Base de Calculo das ferias
        if (tipo =='ferias') {
            base_calculo = this.ferias()
        }
//        Base de Calculo do 13o antes da PA
        if (tipo =='pa_decimo_terceiro') {
            base_calculo = this.decimo_terceiro()
        }
        base_calculo -= deducao_dependente
        valor_final_irrf = 0
        valores_irrf = Object.values(faixas_irrf)
        for (count=(valores_irrf.length)-1;count>=0;count--) {
            if (base_calculo>valores_irrf[count]['piso']) {
                valor_final_irrf = ((base_calculo*valores_irrf[count]['aliquota'])- valores_irrf[count]['deducao'])
                break;
            }
        }
        if (tipo =='ferias' || tipo =='decimo_terceiro' || tipo =='remuneracao') {
            valor_final_irrf = rounddown(valor_final_irrf)
        }
        else {
            valor_final_irrf = Math.round((valor_final_irrf)*100)/100
        }
        return valor_final_irrf
    }

    this.outros_descontos_dedutiveis = function (id='soma_descontos_dedutiveis') {
        valor_outros_descontos = document.getElementById(id).value.replace(/,/g, '.')
        if (isNaN(valor_outros_descontos)) {
            alert('Informe um valor numérico')
            outros_descontos = 0
        }
        else if (valor_outros_descontos=='') {
            outros_descontos = 0
        }
        else {
            outros_descontos = (parseFloat(valor_outros_descontos))
        }
        return outros_descontos
    }
    this.reparacao_erario = function () {
        return this.outros_descontos_dedutiveis ('soma_reparacao_erario')
    }
    this.outros_descontos_nao_dedutiveis = function () {
        return this.outros_descontos_dedutiveis ('soma_descontos_nao_dedutiveis')
    }

//    SOMAS
    this.remuneracao_fixa = function() {
        soma = (this.soldo() + this.apg() + this.ats() + this.compl_soldo() + this.aom() + this.gfr() +
                this.acp() + this.gcef() + this.vpe() + this.grv())
        return soma
    }
    this.remuneracao_total = function(variavelqualqer=0) {
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
        soma = (this.cota_pe() + this.pensao_alim() + this.pensao_alim_pe() + this.contr_pensao_militar() +
                this.contr_pensao_militar_adic() + this.fundo_saude() + this.fundo_saude_adicional()  + this.irrf() +
                 this.outros_descontos_nao_dedutiveis() + this.outros_descontos_dedutiveis() + this.reparacao_erario())
        return soma
    }
    this.rendimento_liquido = function() {
        soma = (this.rendimento_bruto() - this.descontos_total())
        return soma
    }

//    RENDIMENTOS EVENTUAIS
    this.decimo_terceiro = function() {
        soma = (this.soldo() + this.apg() + this.ats() + this.aom() + this.gfr() +
                this.acp() + this.gcef() + this.vpe() + this.grv() + this.gfne() + this.pttc())
        return soma
    }
    this.ferias = function() {
        if (document.getElementById('situacao_funcional').value=='ativo') {
            valor_ferias = Math.round((this.decimo_terceiro()/3)*100)/100
        }
        else if (document.getElementById('bool_pttc').value=='sim'){
            valor_ferias = Math.round((this.pttc()/3)*100)/100
        }
        else {
            valor_ferias = 0
        }
        return valor_ferias
    }
    this.auxilio_fardamento = function() {
        if (document.getElementById('situacao_funcional').value=='ativo') {
            valor_fardamento = rounddown(this.decimo_terceiro()/4)
        }
        else {
            valor_fardamento = 0
        }
        return valor_fardamento
    }

//    DESCONTOS EVENTUAIS
    this.irrf_decimo_terceiro = function() {
        return this.irrf('decimo_terceiro')
    }
    this.irrf_ferias = function() {
        return this.irrf('ferias')
    }
    this.pa_decimo_terceiro = function() {
        return this.pensao_alim('pa_decimo_terceiro')
    }
}


function getMes (coluna) {
    return document.getElementById('mes').cells[coluna].headers
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

function preencher_celula(id,col){

    if (typeof(window['verbas'+col][id])==='function') {
        valor = window['verbas'+col][id]()
    }
    else {
        valor = window['verbas'+col][id]
    }
    document.getElementById(id).cells[col].innerHTML = parseMoney (valor)
}

function rounddown(x) {
    return Math.floor(x*100)/100
}


//Formula base de calculo das parcelas vinculadas ao posto/graduacao
function calcular_rubricas (col){

        mes = getMes(col)
        salario_row = document.getElementById('salario').rows
        for (row=0;row<salario_row.length;row++){
            if (salario_row[row].hasAttribute('id') && salario_row[row].id != 'mes'){
                preencher_celula(salario_row[row].id,col)
            }
            else {
                continue
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