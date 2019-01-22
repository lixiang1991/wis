var rule_tags=[{'key':'main_obj','name':'主体','color':'red','required':true,'actived':true},
{'key':'action','name':'行为','color':'orange','required':true,'actived':true},
{'key':'sub_obj','name':'客体','color':'yellow','required':false,'actived':true},
{'key':'date','name':'时间','color':'green','required':false,'actived':true},
{'key':'area','name':'地点','color':'teal','required':false,'actived':true},
{'key':'number','name':'数值','color':'cyan','required':false,'actived':true},
{'key':'level','name':'密级','color':'blue','required':true,'actived':true}]
var num_selects=['=','>=','<=']
var levels=['公开','秘密','机密','绝密']
var current_line_num=1;
$(document).ready(function(){
        add_rule_buttons();
    });
    var canSubmit=true;

    var csrftoken = Cookies.get('csrftoken');
    var show_reward=true;
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
          if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
          }
        }
    });
function add_rule_buttons(){
    var html='';
    rule_tags.forEach(function(tag,index,array){
        html+='<button id="rule_btn_'+index+'" onclick="click_rule_button('+index+')" type="button" class="btn color-'+tag['color']+'">'+tag['name']+'</button> '
    });
    $('#rule_buttons').append($(html));
}
function click_rule_button(index){
    var tag=rule_tags[index];
    if(tag['required']) return;
    tag['actived']=!tag['actived'];
    $('#rule_btn_'+index).toggleClass('color-'+tag['color']);
    $('#rule_btn_'+index).toggleClass('color-outline-'+tag['color']);
}
function add_rule_line(){
    var html='<li id="rule_line_'+current_line_num+'" onclick="c('+current_line_num+')" class="list-group-item bg-light d-flex justify-content-between align-items-center">';
    rule_tags.forEach(function(tag,index,array){
        if(tag['actived']){
            right_span_class=''
            if(tag['key']=='number'){
                input_html='<select id="num_compare" >';
                num_selects.forEach(function(sel,i,sels){
                    input_html+='<option>'+sel+'</option>';
                });
                input_html+='</select><input id="input_'+current_line_num+'_'+index+'" type="text" style="width:44px">';
            }
            else if(tag['key']=='level'){
                input_html='<select id="level_select" >';
                levels.forEach(function(sel,i,sels){
                    input_html+='<option>'+sel+'</option>';
                });
                input_html+='</select>';
                right_span_class=''
            }
            else{
                input_html='<input id="input_'+current_line_num+'_'+index+'" type="text" >';
            }
            html+='<span class="badge color-'+tag['color']+' '+right_span_class+'">'+tag['name']+input_html+'</span>';
        }
    });
    html+='<button id="submit_rule_btn" onclick="submit_rule('+current_line_num+')" class="btn btn-sm btn-dark">保存</button></li>';
    $('.rule_lines').append($(html));
    $('#rule_line_'+current_line_num).find('input').unbind('change').bind('change', function(){
            $(this).width(textWidth($(this).val()));
        })
    set_test_rule(current_line_num);
    current_line_num+=1;
}
function submit_rule(current_line_num){
    data={'index':current_line_num};
    rule_tags.forEach(function(tag,index,array){
        if(tag['key']=='number'){
            data[tag['key']+'_c']=$('#num_compare').val();
            data[tag['key']+'_v']=$('#input_'+current_line_num+'_'+index).val();
        }
        else if(tag['key']=='level'){
            data[tag['key']]=$('#level_select').val()
        }
        else{
            data[tag['key']]=$('#input_'+current_line_num+'_'+index).val();
        }
    });
    $.post('submit_rule/',data,function(json){
        console.log(json);
    });
}
function submit_doc() {
    var canSubmit=true;
    var $submit_doc_btn=$('#submit_doc_btn');
    var $doc_content=$('#doc_content');
    if(!canSubmit||$doc_content.val()==''){
        return;
    }
    canSubmit=false;
    $submit_doc_btn.attr('disabled',"true")
    var inputData = {
        'content': $doc_content.val()
    }
    need_clear=$('#need_clear_btn').prop('checked')
    console.log(need_clear)
    if(need_clear){
        $('#level_result').empty();
    }
    var $submit_doc = $.post('submit_doc/',inputData,function(json){
        $submit_doc_btn.removeAttr("disabled");//将按钮可用
        canSubmit=true;
        add_level_result(json)
    });

}

function set_test_rule(current_line_num){
    data={0:'人',1:'死于吸烟',2:'',3:'2013年',4:'中国','number_c':'>=','number_v':'100万','level':'秘密'};
    rule_tags.forEach(function(tag,index,array){
        if(tag['key']=='number'){
            $('#num_compare').val(data['number_c']);
            $('#input_'+current_line_num+'_'+index).val(data['number_v']);
        }
        else if(tag['key']=='level'){
            $('#level_select').val(data['level'])
        }
        else{
            $('#input_'+current_line_num+'_'+index).val(data[index]);
        }
        $('#input_'+current_line_num+'_'+index).trigger('change');
    });
}
function set_test_doc(){
    texts=['研究显示，自1990年以来，多数国家的男女吸烟者比率下降了，但烟客总数和死于吸烟相关疾病的人数有增加的趋势。\n研究员在《柳叶刀》（Lancet）发表的《全球疾病负担报告》中指出，在2015年，每四名男性和每20名女性中，只有一人吸烟；这同25年前每三名男性和每12名女性中，就有一人吸烟相比显著下降。\n不过，由于全球人口不断增加，在同段时期死于吸烟相关疾病的人数增加了4.7%，达到640万人。\n此外，每日吸烟的人数也从1990年的8亿7000万人，增加至2015年的9亿3000多万人，增幅达7%。该报告指出，全球每10人就有一人死于吸烟相关疾病，其中半数来自四个国家，即中国、印度、美国和俄罗斯。',
    '据《中国成人烟草调查报告》，2015年中国15岁及以上成人吸烟人数高达3.15亿，此数据让中国稳居世界吸烟人口数榜首。\n根据我国2013年印发的《控烟健康教育核心信息》，中国每年因吸烟死亡的人数超过100万，比艾滋病、结核病和疟疾导致的死亡人数之和还要多。\n问烟民们想戒烟吗？他们是想戒烟的！2015年中国成人烟草流行调查报告中的数据显示，\n17.6%的吸烟者有戒烟的想法，31.5%的吸烟者在过去一年尝试戒烟。但大部分人短期内又复吸了。'
    ]

    $('#doc_content').val(texts[1])
}
function add_level_result(json){
    if( json.success){
        marked_sentences=json.marked_sentences
        for(var  i in marked_sentences){
            msent=marked_sentences[i]
            sentence=msent.sentence
            rule_tags.forEach(function(tag,index,array){
                tag_key=tag['key']
                if(tag_key in msent){
                    sentence=sentence.replace(msent[tag_key],'<span class="color-'+tag['color']+'">'+msent[tag_key]+'</span>')
                }
            });

            html='<a href="#" class="list-group-item list-group-item-action flex-column align-items-start">'
            html+=        '<div class="d-flex w-100 justify-content-between">'
            html+=        '<h5><span class="badge color-blue">'+msent.level+'</span></h5><h5><span class="badge color-pink">'+msent.score+'</span></h5>'
            html+=        '</div><p class="mb-1">'+sentence+'</p></a>'
            $('#level_result').append($(html));
        };
    }
}
function c (line_num){
    return
}
function textWidth(text){
    var sensor = $('<pre>'+ text +'</pre>').css({display: 'none'});
    $('body').append(sensor);
    var width = sensor.width();
    sensor.remove();
    return width;
};
function get_rule_menu_html(){
    /*<button type="button" class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      <span class="sr-only">Toggle Dropdown</span>
    </button>
    <div class="dropdown-menu">
      <a class="dropdown-item" href="#">测试</a>
      <div role="separator" class="dropdown-divider"></div>
      <a class="dropdown-item" href="#">删除</a>
    </div>*/
}

function mutil_line_string(fn){
    return fn.toString().replace('/*','').replace('*/','').split('\n').slice(1,-1).join('\n') + '\n'
}