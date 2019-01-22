var svg_path={
    add:'M16,6 L12,6 L12,2 C12,1.447 11.553,1 11,1 L7,1 C6.447,1 6,1.447 6,2 L6,6 L2,6 C1.447,6 1,6.447 1,7 L1,11 C1,11.553 1.447,12 2,12 L6,12 L6,16 C6,16.553 6.447,17 7,17 L11,17 C11.553,17 12,16.553 12,16 L12,12 L16,12 C16.553,12 17,11.553 17,11 L17,7 C17,6.447 16.553,6 16,6 L16,6 Z',
    del:'M2,12 C1.447,12 1,11.553 1,11 L1,7 C1,6.447 1.447,6 2,6 L16,6 C16.553,6 17,6.447 17,7 L17,11 C17,11.553 16.553,12 16,12 L2,12 L2,12 Z',
    edit:'M16.479,2.536 L14.474,0.546 C13.935,0.00899999997 13.091,-0.019 12.59,0.482 L3.47,9.616 C3.47,9.616 1.158,14.936 1.001,15.366 C0.876,15.706 1.307,16.137 1.605,15.991 C2.085,15.754 7.345,13.471 7.345,13.471 L16.487,4.299 C16.989,3.797 17.018,3.073 16.479,2.536 L16.479,2.536 Z M2.312,13.906 L4.033,10.279 L4.015,10.985 L5.013,10.971 L14.537,1.529 L15.796,2.765 L6.612,11.73 L6.385,12.482 L6.871,12.968 L3.06,14.624 L2.312,13.906 L2.312,13.906 Z'
}
var pos_select_html={
    en:'<select class="form-control" id="pos_en"><option value="<NONE>">选择词性</option>',
    cn:'<select class="form-control" id="pos_cn"><option value="<NONE>">选择词性</option>'
}
var symbol_select_html='<select class="form-control" id="symbol"><option value="<NONE>">选择词与义原的关系</option>'
var default_iconStyle={
    normal: {
        borderColor: '#666',
        color: 'none'
    },
    emphasis: {
        borderColor: '#3E98C5',
    }
}
var init_toolbox_option={
    show : true,
    feature : {
        dataView : {show: true, readOnly: true},
        restore : {show: true},
        myadd: {
            show: true,
            title: '新增',
            icon: 'path://'+svg_path.add,
            onclick: function (){
                change_op_mode('add','新增')
            },
            iconStyle: default_iconStyle
        },
        myedit: {
            show: true,
            title: '编辑',
            icon: 'path://'+svg_path.edit,
            onclick: function (){
                change_op_mode('edit','编辑')
            },
            iconStyle: default_iconStyle
        },
        mydel: {
            show: true,
            title: '删除',
            icon: 'path://'+svg_path.del,
            onclick: function (){
                change_op_mode('del','删除')
            },
            iconStyle:default_iconStyle
        }
    }
}
//禁用get缓存
$.ajaxSetup({cache:false});
var myChart = echarts.init(document.getElementById('main'));
myChart.showLoading();

glossary_word='长城'
init_sememe_nodes=null
init_sememe_links=null
init_sememe_categories=null
init_glossary_nodes=null
init_glossary_links=null
search_word_result={}
click_glossary_btn()
init_sememe()
init_keydown()
init_graph_click()
init_pos_select_option()
init_symbol_select_option()
op_mode='' //操作模式（新增、编辑、删除）
load_index=-1 //load层的index
input_index=-1 //输入层的index
select_en_flag=false//指示是否可以选择义原
select_symbol_flag=false//指示是否
function init_graph_click(){
    myChart.on('click', function (params) {
        if (params.componentType === 'series'&&params.seriesType === 'graph'&&params.dataType === 'node') {
            if(op_graph=='sememe') {
                // 点击到了义原图的node（节点）上。
                console.log(params)
                node_nis=params.name.split(':')
                node_name=node_nis[0]
                node_id=node_nis[1]
                node_data=params.data
                name_split=node_name.split('|')
                name_en=name_split[0]
                name_cn=name_split[1]
                if(op_mode==''){
                    //普通模式，加载该节点的子节点。
                    request_data={'id':node_id}
                    $.get( hownetUrl, request_data , function (result) {
                        series_data=get_series_data('义原')
                        concat_nodes=merge_data(result.nodes,series_data.data)
                        concat_links=merge_data(result.links,series_data.links)
                        myChart.setOption({
                            series: [{
                                name: '义原',
                                data: concat_nodes,
                                links: concat_links,
                            }]
                        });
                    });
                }
                else if(op_mode=='add'){
                    input_index = layer.open({
                        title:'新增义原',
                        btn: ['提交','取消'],
                        yes: function(index, layero){
                            var en=$("#name_en").val()
                            var cn=$("#name_cn").val()
                            if(check_sememe_input(en,cn)){
                                load_index = layer.load();
                                add_sememe(en,cn,node_id,node_data)
                            }
                        },
                        btn2: function(index, layero){
                            //close
                        },
                        content:'<p>'+ '为['+node_name+']新增子义原</p>'+
                                '<input id="name_en" class="form-control mr-sm-2 col-12" type="text"  placeholder="输入英文" >'+
                                '<input id="name_cn" class="form-control mr-sm-2 col-12" type="text"  placeholder="输入中文" >'
                    });
                }
                else if(op_mode=='edit'){
                    input_index = layer.open({
                        title:'编辑义原',
                        btn: ['提交','取消'],
                        yes: function(index, layero){
                            var en=$("#name_en").val()
                            var cn=$("#name_cn").val()
                            if(check_sememe_input(en,cn)){
                                load_index = layer.load();
                                edit_sememe(en,cn,node_id,node_data)
                            }
                        },
                        btn2: function(index, layero){
                            //close
                        },
                        content:'<p>'+ '编辑['+node_name+']义原</p>'+
                                '<input id="name_en" class="form-control mr-sm-2 col-12" type="text"  placeholder="输入英文" value="'+name_en+'">'+
                                '<input id="name_cn" class="form-control mr-sm-2 col-12" type="text"  placeholder="输入中文" value="'+name_cn+'">'
                    });
                }
                else if(op_mode=='del'){
                    input_index = layer.open({
                        title:'删除义原',
                        btn: ['确定','取消'],
                        yes: function(index, layero){
                            load_index = layer.load();
                            delete_sememe(node_id,node_data)
                        },
                        btn2: function(index, layero){
                            //close
                        },
                        content:'<p>'+ '确定要删除['+node_name+']义原吗？</p>'+
                                '<p>'+ '子义原也将一并删除！</p>'
                    });
                }
            }
            else if(op_graph=='glossary') {
                // 点击到了词汇图的node（节点）上。
                console.log(params)
                node_nis=params.name.split(':')
                node_name=node_nis[0]
                node_id=node_nis[1]
                node_data=params.data
                name_split=node_name.split('|')
                name_en=name_split[0]
                name_cn=name_split[1]
                click_node_type=''
                if(params.seriesName=='义原'){
                    click_node_type='rs'//右侧义原
                }
                else{
                    if(node_data.value==180){
                        click_node_type='lc'//左侧中文
                        node_name=params.name
                    }
                    else if(node_data.value==140){
                        click_node_type='le'//左侧英文
                    }
                    else{
                        click_node_type='ls'//左侧义原
                    }
                }
                if(op_mode=='add'){
                    //点击中文，弹框添加英文词汇；
                    //点击英文，提示点击右侧义原进行选择；select_en_flag=true
                    //点击义原,select_en_flag==false时无效；否则弹框选择符号。提交后新增该关系。
                    switch(click_node_type){
                        case 'lc':
                            input_index = layer.open({
                                title:'新增英文释义',
                                btn: ['提交','取消'],
                                yes: function(index, layero){
                                    var en=$("#name_en").val()
                                    var pos_en=$('#pos_en').val()
                                    if(check_name_en(en)){
                                        load_index = layer.load();
                                        add_glossary_en(en,pos_en)
                                    }
                                },
                                btn2: function(index, layero){
                                    //close
                                },
                                content:'<p>'+ '为['+node_name+']新增英文释义</p>'+
                                        '<input id="name_en" class="form-control mr-sm-2 col-12" type="text"  placeholder="输入英文" >'+pos_select_html['en']
                            });
                            break;
                        case 'le':
                            select_en_flag=node_name+'|'+glossary_word
                            input_index = layer.open({
                                title:'新增包含的义原',
                                btn: ['确定','取消'],
                                yes: function(index, layero){
                                    select_symbol_flag=$("#symbol").val()
                                    layer.msg('请在右侧义原图中为['+select_en_flag+']选择包含的义原！');
                                },
                                btn2: function(index, layero){
                                    //close
                                },
                                content:'<p>'+ '将为['+select_en_flag+']新增义原，选择关系后再选择义原</p>'+
                                        '<p>'+ '如不选择则使用默认关系，表示“包含此义原”</p>'+
                                        symbol_select_html
                            });
                            break;
                        case 'rs':
                        case 'ls':
                            if(select_en_flag===false)
                                return
                            if(select_symbol_flag===false)
                                return
                            input_index = layer.open({
                                title:'新增包含的义原',
                                btn: ['提交','取消'],
                                yes: function(index, layero){
                                    load_index = layer.load();
                                    add_glossary_relation(en,pos_en)
                                },
                                btn2: function(index, layero){
                                    //close
                                },
                                content:'<p>'+ '将为['+select_en_flag+']新增关系为['+select_symbol_flag+']的义原['+node_name+']，是否提交？</p>'
                            });
                            break;
                    }

                }
                else if(op_mode=='edit'){
                    //点击中文，弹框编辑该中文词汇；
                    //点击英文，弹框编辑该英文词汇；
                    //点击左侧义原，提示点击右侧义原进行选择以替换该义原；select_sememe=true
                    //点击右侧义原,当select_sememe==false时无效；否则弹框选择符号。提交后替换该关系。
                    input_index = layer.open({
                        title:'编辑义原',
                        btn: ['提交','取消'],
                        yes: function(index, layero){
                            var en=$("#name_en").val()
                            var cn=$("#name_cn").val()
                            if(check_sememe_input(en,cn)){
                                load_index = layer.load();
                                edit_sememe(en,cn,node_id,node_data)
                            }
                        },
                        btn2: function(index, layero){
                            //close
                        },
                        content:'<p>'+ '编辑['+node_name+']义原</p>'+
                                '<input id="name_en" class="form-control mr-sm-2 col-12" type="text"  placeholder="输入英文" value="'+name_en+'">'+
                                '<input id="name_cn" class="form-control mr-sm-2 col-12" type="text"  placeholder="输入中文" value="'+name_cn+'">'
                    });
                }
                else if(op_mode=='del'){
                    //点击中文，弹框提示将会删除整个词汇；
                    //点击英文，弹框提示将删除该英文词汇；
                    //点击左侧义原，弹框提示将删除该义原；
                    //点击右侧义原,无效。
                    input_index = layer.open({
                        title:'删除义原',
                        btn: ['确定','取消'],
                        yes: function(index, layero){
                            load_index = layer.load();
                            delete_sememe(node_id,node_data)
                        },
                        btn2: function(index, layero){
                            //close
                        },
                        content:'<p>'+ '确定要删除['+node_name+']义原吗？</p>'+
                                '<p>'+ '子义原也将一并删除！</p>'
                    });
                }
            }
        }
    });
}
function click_sememe_btn(){
    op_mode=''
    op_graph='sememe'
    $("#sememe_search_div").show()
    $("#glossary_search_div").hide()
    myChart.clear()
    init_sememe()
}
function init_sememe(){
    request_data={'id':0}
    if(init_sememe_nodes==null){
        $.get( hownetUrl, request_data, function (json) {
            init_sememe_graph(json)
        });
    }
    else{
        init_sememe_graph(null)
    }
}
function init_sememe_graph(json){
    if(json!=null){
        init_sememe_nodes=json.nodes
        init_sememe_links=json.links
        init_sememe_categories=json.categories
        console.log(init_sememe_nodes)
        return
    }
    series_array=myChart.getOption().series
    series_array.push({
        name: '义原',
        type: 'graph',
        layout: 'force',
        force: {
            repulsion: 50
        },
        data: init_sememe_nodes,
        links: init_sememe_links,
        categories: init_sememe_categories,
        focusNodeAdjacency: true,
        roam: true,
        label: {
            normal: {
                show: false,
                position: 'top',
//                        formatter: '{b}'
            }
        },
        lineStyle: {
            normal: {
                color: 'source',
                curveness: 0
            }
        }
    })
    myChart.setOption(option = {
        tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove'
        },
        toolbox: init_toolbox_option,
        legend: [{
            left:0,
            width:'80%',
            data: init_sememe_categories.map(function (a) {
                return a.name;
            })
        }],
        animationDuration: 1500,
        animationEasingUpdate: 'quinticInOut',
        series:series_array
    });
}

function set_sememe_data(concat_nodes,concat_links){
    series_array=myChart.getOption().series
    array_index=0
    if(series_array.length>1){
        array_index=1
    }
    series_array[array_index]={
        name: '义原',
        data: concat_nodes,
        links: concat_links,
    }
    myChart.setOption({
        series: series_array
    });
}
function search_sememe(){
    var word=$("#sememe_text").val()
    if(word.length==0)
        return
    request_data={'sememe':word}
    $.get( hownetUrl, request_data , function (json) {
        series_data=get_series_data('义原')
        concat_nodes=merge_data(result.nodes,series_data.data)
        concat_links=merge_data(result.links,series_data.links)
        set_sememe_data(concat_nodes,concat_links)
    });
}
function add_sememe(en,cn,pid,pnode_data){
    request_data={'obj':'sememe','op':'add','en':en,'cn':cn,'pid':pid}
    $.post( hownetUrl, request_data , function (result) {
        layer.close(load_index);
        layer.close(input_index);
        if(result.result=='success'){
            new_node=[{
                draggable:"false",
                category:pnode_data.category,
                name:result.ni,
                symbolSize:pnode_data.symbolSize>12?pnode_data.symbolSize-12:12,
                value:40
            }]
            new_link=[{'source':pnode_data.name,'target':result.ni}]
            series_data=get_series_data('义原')
            concat_nodes=merge_data(new_node,series_data.data)
            concat_links=merge_data(new_link,series_data.links)
            set_sememe_data(concat_nodes,concat_links)
        }
    });
}
function edit_sememe(en,cn,id,node_data){
    request_data={'obj':'sememe','op':'edit','en':en,'cn':cn,'id':id}
    $.post( hownetUrl, request_data , function (result) {
        layer.close(load_index);
        layer.close(input_index);
        if(result.result=='success'){
            series_data=get_series_data('义原')
            new_name=en+'|'+cn+':'+id
            edit_node_data(series_data,node_data.name,new_name)
            set_sememe_data(series_data.data,series_data.links)
        }
    });
}
function delete_sememe(node_id,node_data){
    request_data={'obj':'sememe','op':'del','id':node_id}
    $.post( hownetUrl, request_data , function (result) {
        layer.close(load_index);
        layer.close(input_index);
        if(result.result=='success'){
            series_data=get_series_data('义原')
            for(var i in result.nis){
                delete_node_data(series_data.data,result.nis[i])
            }
            layer.msg('删除义原['+node_data.name+']及其子义原，共'+result.nis.length+'个！')
            set_sememe_data(series_data.data,series_data.links)
        }
    });
}
function click_glossary_btn(){
    op_mode=''
    op_graph='glossary'
    $("#word_text").val(glossary_word)
    $("#sememe_search_div").hide()
    $("#glossary_search_div").show()
    myChart.clear()
    init_glossary()
}
function init_glossary(){
    if(search_word_result[glossary_word]){
        init_glossary_graph(search_word_result[glossary_word])
    }
    else{
        request_data={'word':glossary_word}
        $.get( hownetUrl, request_data , function (json) {
            init_glossary_graph(json)
        });
    }
}
function init_glossary_graph(json){
    search_word_result[json.search_word]=json
    init_glossary_nodes=json.nodes
    init_glossary_links=json.links
    console.log(init_glossary_nodes)
    myChart.hideLoading();
    set_color(init_glossary_nodes);
    set_symbol(init_glossary_nodes);
    myChart.clear()
    myChart.setOption(option = {
        tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove'
        },
        toolbox: init_toolbox_option,
        animationDuration: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
            {
                name: '词汇',
                type: 'graph',
                layout: 'force',
                force: {
                    gravity : 0.03,
                    edgeLength: 50,
                    repulsion: 100
                },
                data: init_glossary_nodes,
                links: init_glossary_links,
                focusNodeAdjacency: true,
                roam: true,
                edgeSymbol: ['none', 'arrow'],
                label: {
                    normal: {
                        show: true,
                        position: 'top',
//                        formatter: '{b}'
                    }
                },
                lineStyle: {
                    normal: {
                        color: 'source',
                        curveness: 0
                    }
                }
            }
        ],
    });
}
function set_glossary_data(json){
    search_word_result[json.search_word]=json
    set_color(json.nodes)
    set_symbol(json.nodes)
    series_array=myChart.getOption().series
    series_array[0]={
        name: '词汇',
        data: json.nodes,
        links: json.links,
    }
    myChart.setOption({
        series: series_array
    });
}
function search_glossary(){
    var word=$("#word_text").val()
    if(word.length==0)
        return
    glossary_word=word
    if(search_word_result[glossary_word]){
        set_glossary_data(search_word_result[glossary_word])
    }
    else{
        request_data={'word':glossary_word}
        $.get( hownetUrl, request_data , function (json) {
            set_glossary_data(json)
        });
    }
}
function compare_glossary(){
    var word=$("#word_text").val()
    var word2=$("#word_text2").val()
    json1=null
    json2=null
    if(word.length==0||word2.length==0){
    //两个都不允许为空
        return
    }
    if(search_word_result[word]){
        json1=search_word_result[word]
    }
    if(search_word_result[word2]){
        json2=search_word_result[word2]
    }
    if(json1==null){
        request_data={'word':word}
        $.get( hownetUrl, request_data , function (result) {
            json1=result
            set_glossary_compare_data(json1,json2)
        });
    }
    if(json2==null){
        request_data={'word':word2}
        $.get( hownetUrl, request_data , function (result) {
            json2=result
            set_glossary_compare_data(json1,json2)
        });
    }
}
function set_glossary_compare_data(json1,json2){
    if(json1==null||json2==null)
        return
    concat_nodes=merge_data(json1.nodes,json2.nodes)
    concat_links=merge_data(json1.links,json2.links)
    set_color(concat_nodes)
    set_symbol(concat_nodes)
    myChart.setOption({
        series: [{
            name: '词汇',
            data: concat_nodes,
            links: concat_links,
        }]
    });
}
var value2color={
    180:'#d87c7c',
    140:'#d7ab82',
    120:'#61a0a8',
    100:'#6e7074'
}
var symbol2shape={
    '#':'rect',
    '%':'roundRect',
    '$':'triangle',
    '*':'diamond'
}
function set_symbol(nodes){
    $.each(nodes, function(index, node, array) {
        first_char=node['name'].substr(0,1)
        if(symbol2shape[first_char])
            node['symbol']=symbol2shape[first_char]
    });
}
function set_color(nodes){
    $.each(nodes, function(index, node, array) {
        node['itemStyle']={
        normal: {
            color:value2color[node['value']]
        }
    }
    });
}
function set_show(node){
    if(node['name']){
        node['label']={
            normal: {
                show:true
            }
        }
    }
}
function merge_data(source,target){
    var result=clone(target);
    for(var i in source){
        t_obj=source[i]
        if(!check_exist(result,t_obj)){
            set_show(t_obj)
            result.push(t_obj)
        }
    }
//    console.log(result)
    return result;
}
function check_exist(list,t_obj){
//    console.log(list)
    for(var i in list){
        s_obj=list[i]
        if(check_equal(s_obj,t_obj)){
            set_show(s_obj);
            return true;
        }
    }
    return false;
}
function check_equal(s_obj,t_obj){
//    console.log(s_obj)
    result = true;
    for(var key in s_obj){
        if(key == 'name'){
            return s_obj[key]==t_obj[key]
        }
        else if(s_obj[key]!=t_obj[key]){
//            console.log(s_obj[key]+" - "+t_obj[key])
            result = false;
        }
    }
    return result;
}

function clone(obj) {
    var o;
    if (typeof obj == "object") {
        if (obj === null) {
            o = null;
        } else {
            if (obj instanceof Array) {
                o = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    o.push(clone(obj[i]));
                }
            } else {
                o = {};
                for (var j in obj) {
                    o[j] = clone(obj[j]);
                }
            }
        }
    } else {
        o = obj;
    }
    return o;
}

function init_keydown(){
 $("#sememe_text").keydown(function(event) {
        // Submit the input when the enter button is pressed
        if (event.keyCode == 13) {
          search_sememe();
        }
      });
      $("#word_text").keydown(function(event) {
        // Submit the input when the enter button is pressed
        if (event.keyCode == 13) {
          search_glossary();
        }
      });
      $("#word_text2").keydown(function(event) {
        // Submit the input when the enter button is pressed
        if (event.keyCode == 13) {
          compare_glossary();
        }
      });
}

function change_op_mode(mode,name){
    if(op_mode!=mode){
        select_en_flag=false//每当模式切换时重置该标志位
        select_symbol_flag=false//当模式切换时重置该标志位
        op_mode=mode
        layer.msg(name+'模式开启！');
        if(op_graph=='glossary'){
            split_graph()
        }
        var active_toolbox_option=clone(init_toolbox_option)
        active_toolbox_option.feature['my'+mode].iconStyle={
            normal: {
                borderColor: '#1FBCD2'
            },
        }
        myChart.setOption({
            toolbox:active_toolbox_option
        })
    }
    else{
        op_mode=''
        layer.msg(name+'模式关闭！');
        myChart.setOption({
            toolbox:init_toolbox_option
        })
        restore_graph()
    }
}

function split_graph(){
    series_array=myChart.getOption().series
    if(series_array.length>1){
        return
    }
    init_sememe()
    series_array=myChart.getOption().series
    series_array[0].left=0
    series_array[0].width='50%'
    series_array[1].left='50%'
    series_array[1].width='50%'
    myChart.setOption({
        series:series_array
    })
    console.log(myChart.getOption())
}

function restore_graph(){
    option=myChart.getOption()
    series_array=option.series
    if(series_array.length>1){
        myChart.clear()
        glossary_series=series_array[0]
        glossary_series.left='center'
        glossary_series.width='100%'
        option.series=[glossary_series]
        myChart.setOption(option)
    }
}

function check_sememe_input(en,cn){
    return check_name_en(en)&&check_name_cn(cn)
}
function check_name_en(en){
    if(en.length==0){
        layer.tips('英文不能为空', '#name_en');
        return false
    }
    else if(en.length>30){
        layer.tips('英文长度不能超过30', '#name_en');
        return false
    }
    else{
        var ying = /[a-zA-Z0-9]+/;
        if(!ying.test(en)){
            layer.tips('请输入英文', '#name_en');
            return false
        }
    }
    return true
}
function check_name_cn(cn){
    if(cn.length==0){
        layer.tips('中文不能为空', '#name_cn');
        return false
    }
    else if(cn.length>30){
        layer.tips('中文长度不能超过30', '#name_cn');
        return false
    }
    else{
        var han = /[0-9\u4e00-\u9fa5]+/;
        if(!han.test(cn)){
            layer.tips('请输入中文', '#name_cn');
            return false
        }
    }
    return true
}
function get_series_data(seriesName){
    series=myChart.getOption().series
    for(var i in series){
        ser=series[i]
        if(ser.name==seriesName){
            return ser
        }
    }
    return null
}

function delete_node_data(series_data,node_name){
    for(var i in series_data){
        data=series_data[i]
        if(data.name==node_name){
            console.log(node_name)
            series_data.splice(i,1)
            break
        }
    }
    return series_data
}

function edit_node_data(series_data,node_name,new_name){
    datas=series_data.data
    links=series_data.links
    for(var i in datas){
        data=datas[i]
        if(data.name==node_name){
            data.name=new_name
            set_show(data)
            break
        }
    }
    for(var i in links){
        link=links[i]
        if(link.source==node_name){
            link.source=new_name
        }
        if(link.target==node_name){
            link.target=new_name
        }
    }
    return series_data
}

function add_glossary_en(en,pos_en){
    request_data={'obj':'glossary','op':'add','en':en,'cn':glossary_word,'pen':pos_en}
    $.post( hownetUrl, request_data , function (result) {
        layer.close(load_index);
        layer.close(input_index);
        if(result.result=='success'){
            new_node=[{
                draggable:"false",
                category:pnode_data.category,
                name:result.ni,
                symbolSize:pnode_data.symbolSize>12?pnode_data.symbolSize-12:12,
                value:40
            }]
            new_link=[{'source':pnode_data.name,'target':result.ni}]
            series_data=get_series_data('义原')
            concat_nodes=merge_data(new_node,series_data.data)
            concat_links=merge_data(new_link,series_data.links)
            set_sememe_data(concat_nodes,concat_links)
        }
    });
}

function init_pos_select_option(){
    $.get( posUrl , function (json) {
        for(var key in json){
            values=json[key]
            for(var i in values){
                var pos_val=values[i]
                pos_select_html[key]+='<option value="'+pos_val.value+'">'+pos_val.text+' ('+pos_val.value+')'+'</option>'
            }
            pos_select_html[key]+='</select>'
        }
    })
}

function init_symbol_select_option(){
    $.get( symbolUrl , function (json) {
        for(var i in json){
            var sym_val=json[i]
            symbol_select_html+='<option value="'+sym_val.value+'">'+sym_val.text+' ('+sym_val.value+')'+'</option>'
        }
        symbol_select_html+='</select>'
    })
}