for (col=1;col<document.getElementById('mes').cells.length;col++){
    window['verbas'+col] = new Verbas
}

//addEventListener para selects, chamando as funcoes inscritas nos names dos campos
function calc_from_tags(tag){
    tags = document.getElementsByTagName(tag)
    for (var i = 0; i < tags.length; i++) {
        if (tags[i].hasAttribute('name')){
            action = ((tags[i].type=="text")? 'blur' : 'change')
            tags[i].addEventListener(action, function (event) {
                    var loop = loop_cols(window[event.target.name])
                    loop();
//                    TODO: Apenas o ultimo selects com attr name está funcionando. Pq?
                }
            );
        }
    }
}
calc_from_tags('select');
calc_from_tags('input');