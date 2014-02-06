function getAccId() {
    var scripts = document.getElementsByTagName("script");
    var html = "";
    var account_id = 0;
    var async = null;
    for (var i = 0; i < scripts.length; i++) {
        html = scripts[i].innerHTML;
        var match =  html.match(/account_id\s*=\s*([0-9]+)/);
        if(match){
            if(html.match(/js_visitor_settings.php/))
                async = false;
            else if(html.match(/j.php/))
                async = true;
        }
        if(async != null){
            account_id = match[1];
            return account_id;
        }
    }
    return null;
}

function vwo_custom(){
    vwo_create();
    var ruta	= '*';
    var accId   = 196;
    var expID	= 180;
    var combi	= 1;
    var url     = 'http://heatmap.visualwebsiteoptimizer.com/process_clickmap.php?experiment_id='+expID+'&account_id='+accId+'&action=return_logs&jsoncallback=crunch_data&combination='+combi+'&url='+ruta;
    script = document.createElement('script');script.src=url;
    var head=document.getElementsByTagName('head')[0];
    head.appendChild(script);

    total_clicks = 0;
    total_clicks_on_links=0;
    largest_y = 0;
    largest_x = 0;
    notrobats	= [];
}

function vwo_reset(){
    vwo_$("#loading_status .message").html("");
}

function vwo_create(){
    if(vwo_$('#loading_status').length == 0){
        vwo_$('<div id="loading_status"><div class="message"></div></div>').appendTo('body');
        vwo_$('#loading_status').css({
            'position'	: 'fixed',
            'top'		: 0,
            'left'		: 0,
            'border'	: '1px solid black',
            'padding'	: '10px',
            'background-color':'white',
            'z-index'	: 100000000,
            'overflow'	:'scroll',
            'height'	: '100%',
            'max-width'	: '300px'
        });
    }
    create_canvas_element();
}
function crunch_data(data) {
    vwo_$("#loading_status .message").html("Generating Heatmap...");
    for (var path in data) {
        vwo_$.each(data[path], function (i) {
            try {
                var point = data[path][i];
                get_x_y(path, parseFloat(point[0]), parseFloat(point[1]));
            } catch (e) {}
        })
    }
    delete data;
    draw();
    getResizedImage();
    //tanca_informa();
    if(vwo_$("#loading_status .message").find('br').length==0){
        vwo_$('#loading_status').hide();
    }
}
var llistats = ['correu_','checkbox_','panel\\-accept\\-','panel\\-alert\\-','panel\\-confirm\\-'];
var llist_total = llistats.length;
function get_x_y(path, percent_x, percent_y) {
    var elem = vwo_$(path);
    if(elem.length==0){
        var r,e;
        for(i=0;i<llist_total;i++){
            if(path.indexOf(llistats[i])!=-1){
                r = new RegExp("#"+llistats[i]+"[a-zA-Z0-9]+");
                e = vwo_$(path.replace(r,'[id^='+llistats[i]+']'));

                if(e.length>0){
                    elem=e;
                    break;
                }
            }
        }
    }
    if (elem.length>0) {
        try {
            if (percent_x < 0.05) percent_x = percent_x * 10;
            if (percent_y < 0.05) percent_y = percent_y * 10;
            x = Math.round(percent_x * elem.outerWidth() + elem.offset().left);
            y = Math.round(percent_y * elem.outerHeight() + elem.offset().top);
            if (x == 0 && y == 0){
                return null;
            }
        } catch (e) {
            return null;
        }
        elem.removeAttr("title");
        total_clicks++;


        if (elem[0].tagName.toLowerCase() == "a") {
            total_clicks_on_links++;
        } else if (vwo_$(elem).parents("a").length > 0) {
            elem = elem.parents("a")[0];
            total_clicks_on_links++;
        }


        if (elem) {
            clicks = vwo_$(elem).attr("elem_clicks");
            if (clicks) {
                vwo_$(elem).attr("elem_clicks", parseInt(clicks) + 1);
            } else {
                vwo_$(elem).attr("elem_clicks", "1");
            }
        }else{
console.log(path);
}


        if (x > largest_x){
            largest_x = x;
        }
        if (y > largest_y){
            largest_y = y;
        }

	if(x>5 && y>5)        
		addDataPoint(x, y);
    } else {
        informa(path);
        return null;
    }
}
function informa(ruta){
    if(typeof notrobats[ruta]=='undefined'){
        notrobats[ruta]=1;
    }else{
        notrobats[ruta]++;
    }
}
function tanca_informa(){
    vwo_$("#loading_status .message").html("");
    var sortida;
    for(var ruta in notrobats){
        sortida = ruta+" : <b>"+notrobats[ruta]+"</b><br>";
        vwo_$("#loading_status .message").append(sortida);
    }
    vwo_$("#loading_status b").css('font-weight','bold');
}

function clickCounter(){
    vwo_$('*[elem_clicks]').each(function(){
        var el=vwo_$(this);
        creaBitxo(el);
    });
}
function creaBitxo(element){
    if(vwo_$('#bitxo').length == 0){
        vwo_$('body').append('<div id="bitxo" />');
        vwo_$('#bitxo').css({
            'position':'absolute',
            'top':0,
            'left':0
        });
    }

    var clicks	= element.attr('elem_clicks');
    var o		= element.offset();
    var top		= o.top;
    var lef		= o.left+element.outerWidth(true);

    var div		= vwo_$('<div>'+clicks+'</div>');
    div.css({
        'position':'absolute',
        'z-index':12345678,
        'top':top+'px',
        'left':lef+'px',
        'border':'1px solid black',
        'background-color':'white',
        'opacity':0.5
    });

    vwo_$('#bitxo').append(div);
}

function getDocHeight() {
    var D = document;
    return Math.max(Math.max(D.body.scrollHeight, D.documentElement.scrollHeight), Math.max(D.body.offsetHeight, D.documentElement.offsetHeight), Math.max(D.body.clientHeight, D.documentElement.clientHeight));
}

function getDocWidth() {
    var D = document;
    return Math.max(Math.max(D.body.scrollWidth, D.documentElement.scrollWidth), Math.max(D.body.offsetWidth, D.documentElement.offsetWidth), Math.max(D.body.clientWidth, D.documentElement.clientWidth));
}


