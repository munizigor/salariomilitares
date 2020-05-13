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

function setNewAttributes () {
    var calc_pa = document.getElementById('pa_forma_calculo').getAttribute('data-title')
    document.getElementById('pensao_alim').setAttribute('data-calculo',String(calc_pa))
}

document.addEventListener("DOMContentLoaded", load, false);
document.addEventListener("DOMContentLoaded", setNewAttributes, false);


document.querySelectorAll('.questao').forEach(item => {
    item.title='Clique para obter mais informações'
  if (item.dataset["questionmark"] === 'true') {
    item.innerHTML = '<p>&#10067</p>'
  }
  item.addEventListener('click', event => {
    if (item.tagName==="TR") {
        document.getElementById('exampleModalLabel').innerHTML = item.getElementsByTagName("td")[0].innerHTML
        descricao = ((item.dataset['description']===undefined) ? '':item.dataset['description'])
        base_calculo = ((item.dataset['calculo']===undefined) ? '':'<br/><b>Valores</b>: ' + String(item.dataset['calculo']) + '<br/>')
        base_legal_link = ((item.dataset['legal_base_link']===undefined) ? '':('href=\''+item.dataset['legal_base_link']+'\' target=\'_blank\''))
        base_legal = ((item.dataset['legal_base']===undefined) ? '':'<b><a ' + base_legal_link + '>Base legal</a></b>: ' + item.dataset['legal_base'])
        document.getElementById('exampleModalBody').innerHTML = `
                        <b>Descrição</b>: ${descricao}
                        <br/>
                        ${base_calculo}
                        <br/>
                        ${base_legal}
        `
    }
    else {
    document.getElementById('exampleModalLabel').innerHTML = ((item.dataset['label']===undefined) ? '':item.dataset['label'])
    document.getElementById('exampleModalBody').innerHTML = item.dataset['title']
    }
//    alert(item.title)
    item.dataset['toggle']='modal'
    item.dataset['target']='#exampleModal'
  })
})

//sumir com colunas indesejadas
document.querySelectorAll('.abr2020').forEach(item => {
    item.remove();
})
document.querySelectorAll('.jun2020').forEach(item => {
    item.remove();
})
document.querySelectorAll('.jul2020').forEach(item => {
    item.remove();
})
