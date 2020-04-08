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


document.querySelectorAll('.questao').forEach(item => {
    item.title='Clique para obter mais informações'
  if (item.dataset["questionmark"] === 'true') {
    item.innerHTML = '<p>&#10067</p>'
  }
  item.addEventListener('click', event => {
    if (item.tagName==="TR") {
        document.getElementById('exampleModalLabel').innerHTML = item.getElementsByTagName("td")[0].innerHTML
        descricao = ((item.dataset['description']===undefined) ? '':item.dataset['description'])
        base_legal = ((item.dataset['legal_base']===undefined) ? '':item.dataset['legal_base'])
        base_legal_link = ((item.dataset['legal_base_link']===undefined) ? '#':item.dataset['legal_base_link'])
        document.getElementById('exampleModalBody').innerHTML = `
                        <b>Descrição</b>: ${descricao}
                        <br/><br/>
                        <b><a href=${base_legal_link}
                        target='_blank'>Base legal</a></b>: ${base_legal}
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
