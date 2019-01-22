    $(document).ready(function(){
        $('.collapse').collapse({toggle: false})
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


    var $chatlog = $('.js-chat-log');
    var $input = $('.js-text');
    var $sayButton = $('.js-say');
    var collapseIndex=0;
    var cardNameList=[{'text':'input','show':1},{'text':'analyse','show':1},{'text':'knowledge','show':1},{'text':'template','show':1}]
    var cardNameDict={'input':'预处理','analyse':'文本库','knowledge':'知识图谱','template':'模板库'}
    createBudges();
    function createBudges(){
        html_str=''
        cardNameList.forEach(function(value,index,array){
            text=value.text;
            html_str+='<button type="button" id="btn_'+text+'" class="btn btn-primary ml5">'+cardNameDict[text]+'</button>'
        });
        $('#budgeDiv').append($(html_str));
        $('button[id^="btn_"]').click(function(e){
            type=$(this)[0].id.substring(4);
            cardNameList.forEach(function(value,index,array){
                if(value.text==type){
                    value.show=1-value.show;
                    toggleButton(type,value.show);
                    toggleCard(type,value.show);
                }
            })
            console.log(cardNameList)
        });
    }
    function toggleButton(type,show){
        $btn=$('#btn_'+type);
        $btn.toggleClass('btn-secondary');
        $btn.toggleClass('btn-primary');
    }
    function toggleCard(type,show){
        $cards=$('div[id^="'+type+'_"]');
        if(show)
            $cards.show();
        else
            $cards.hide();
    }
    function clickBudge(e){
        console.log(e);
    }
    function createCollapse(question,json){
        html_str='<div class="card"><div class="card-header" role="tab" id="heading_'+collapseIndex+'">'+
            '<h5 class="mb-0"><a data-toggle="collapse" href="#collapse_'+collapseIndex+'" aria-expanded="true">'+
            question+'---'+json.final_response+' <span style="margin-bottom:4px;vertical-align: middle;" class="badge badge-primary">'+json.final_confidence+'</span> </a></h5></div>'+
            '<div id="collapse_'+collapseIndex+'" class="collapse show" role="tabpanel" aria-labelledby="heading_'+collapseIndex+'" >'+
            '<div class="card-body">';
        cardNameList.forEach(function(value,index,array){
            //是否为最终答案
            right=(parseFloat(json.final_confidence)==parseFloat(json[value.text].confidence))&&json.final_confidence>0
            html_str+=createCard(json[value.text],value.text,right,value.show);
            });
        html_str+='</div></div></div>';
        $('#accordion').append($(html_str));
        collapseIndex+=1;
    }
    function createCard(data,type,right,show){
        color_str='bg-secondary'
        if(right)
            color_str='bg-info'
        hidden_str=''
        if(show==0)
            hidden_str='style="display:none"';
        html_str='<div class="card" id="'+type+'_'+collapseIndex+'" '+hidden_str+
        '><div class="card-header text-white '+color_str+
        '"><span style="float:left;font-size:100%" class="badge badge-primary">'+cardNameDict[type]+
        '</span><strong>'+data.answer+'</strong>';
        if(type!='input')
            html_str+='<span style="margin-bottom:4px;vertical-align: middle;" class="badge badge-primary">'+data.confidence+'</span>';
        html_str+='</div><div class="card-block card-div"><blockquote class="card-blockquote">';
        extra_data=data.statement.extra_data;

        if(type=='input'){
            if(extra_data.replace_str)
                html_str+=createCardRow('实体替换：'+extra_data.replace_str);
            if(extra_data.replace_str2)
                html_str+=createCardRow('实体汇总：'+extra_data.replace_str2);
            if(extra_data.complete_str)
                html_str+=createCardRow('语义补全：'+extra_data.complete_str);
            if(extra_data.replaced_question)
                html_str+=createCardRow(extra_data.replaced_question);
            html_str+=createCardRow(extra_data.pos_str);
            html_str+=createCardRow(extra_data.key_str);
            html_str+=createCardRow(extra_data.core_str);
            html_str+=createCardRow(extra_data.zhu_str);
            html_str+=createCardRow(extra_data.que_type_str);
        }
        else if(type=='analyse'){
            extra_data.evidence_list.forEach(function(evidence_one,index,array){
                html_str+=createCardRow('证据片段['+(index+1)+']：'+insertUnderline(evidence_one,extra_data.cand_sent_list,extra_data.cand_word_list,extra_data.hotword_list));

            });
            extra_data.word_score_list.forEach(function(word_score_one,index,array){
                html_str+=createCardRow('答案['+(index+1)+']：'+word_score_one[0]+'；评分='+word_score_one[1]);

            });
            html_str+=createCardRow('注：<u>下划线</u>表示候选句，候选句编号<span style="line-height: 0.75;" class="badge badge-primary">1</span>表示在该证据中的顺序；');
            html_str+=createCardRow('注：<span style="color:red;">红色字体</span>表示solr查询的高亮词；');
            html_str+=createCardRow('注：<span style="background-color:#28a745;">绿色背景</span>表示候选词；');
            html_str+=createCardRow('注：<span style="font-weight:bold;font-style:italic;">斜体加粗</span>表示热词；');
        }
        else if(type=='knowledge'){
            html_str+=createCardRow('同义替换：['+extra_data.replaced_question+']');
            know_list=['entitys','propertys','relations'];
            know_dict={'entitys':'实体','propertys':'属性','relations':'关系'};
            know_list.forEach(function(know_one,index,array){
                knows=extra_data[know_one];
                if(know_one=='entitys'){
                    a_knows=[];
                    know_labels=extra_data['entitys_label'];
                    knows.forEach(function(ak,ia,ar){
                        a_knows.push(ak+'('+know_labels[ia].join('，')+')');
                    });
                    knows=a_knows;
                }
                if(knows&&knows.length>0){
                    html_str+=createCardRow(know_dict[know_one]+'：['+knows.join('，')+']');
                }
            });
            if(extra_data.match_list){
                extra_data.match_list.forEach(function(match_one,index,array){
                    html_str+=createKnowRow(match_one);
                });
            }
        }
        else if(type=='template'){
            if(extra_data.closest_text){
                html_str+=createCardRow('问题匹配：['+extra_data.closest_text+']；相似度='+extra_data.closest_confidence);
            }
            if(extra_data.score_list){
                extra_data.score_list.forEach(function(score_one,index,array){
                    html_str+=createCardRow('答案['+(index+1)+']：['+score_one.text+']；评分='+score_one.score);
                });
            }
        }
        html_str+='</blockquote></div></div>';
        return html_str;
    }
    function insertUnderline(text,cand_sent_list,cand_word_list,hotword_list){
        var re=new RegExp('<font color="red">(.*?)</font>', 'g');
        hl_words=[];
        hl_word=re.exec(text);
        hl_words_dict={}
        //记录下所有需要高亮的词
        while(hl_word!=null){
            //去除重复词，并按照词的字数排序，字数多的靠前
            word=hl_word[1];
            if(!hl_words_dict[word]){
                hl_words.push(word);
                hl_words_dict[word]=1;
            }
            hl_word=re.exec(text);
        }
        //去除掉<font>标签
        var no_font_text=text.replace(new RegExp('<font color="red">', 'g'), '').replace(new RegExp('</font>', 'g'), '');
        var under_line_text=no_font_text;
        cand_sent_list.forEach(function(cand_sent_one,index,array){
            var start=under_line_text.indexOf(cand_sent_one);
            if(start>-1){
                //给候选句添加下划线标签
                var end=start+cand_sent_one.length;
                under_line_text=under_line_text.substring(0,start)+'<u>'+cand_sent_one+'</u>'+under_line_text.substring(end);
            }
        });
        //给候选句加上编号
        var re=new RegExp('[^>]{1}</u>', 'g');
        u_tag=re.exec(under_line_text);
        index=1;
        while(u_tag!=null){
            var num_tag='<span style="line-height: 0.75;" class="badge badge-primary">'+index+'</span>';
            under_line_text=under_line_text.substring(0,u_tag.index+1)+num_tag+under_line_text.substring(u_tag.index+1);
            u_tag=re.exec(under_line_text);
            index+=1;
        }
        sorted_word_list=[];
        cand_word_list.forEach(function(word_text,index,array){
            word={'text':word_text,'cand':1,'hot':0,'hl':0}
            setWord(sorted_word_list,word)
        });
        hl_words.forEach(function(word_text,index,array){
            word={'text':word_text,'cand':0,'hot':0,'hl':1}
            setWord(sorted_word_list,word)
        });
        hotword_list.forEach(function(word_text,index,array){
            word={'text':word_text,'cand':0,'hot':1,'hl':0}
            setWord(sorted_word_list,word)
        });
        sorted_word_list.forEach(function(word_one,index,array){
            var start=under_line_text.indexOf(word_one['text']);
            if(start>-1){
                var end=start+word_one['text'].length;
                var style_str='<span style="';
                //候选词添加绿色背景色
                if(word_one['cand']){
                    style_str+='background-color:#28a745;';
                }
                //solr的高亮词重新加上红色字体
                if(word_one['hl']){
                    style_str+='color:red;';
                }
                //热词加粗
                if(word_one['hot']){
                    style_str+='font-weight:bold;font-style:italic;';
                }
                style_str+='">';
                under_line_text=under_line_text.substring(0,start)+style_str+word_one['text']+'</span>'+under_line_text.substring(end);
            }
        });
        return under_line_text
    }
    function setWord(list,word){
        var exist=false;
        list.forEach(function(word_one,index,array){
            if(word_one['text']==word['text']){
                exist=true;
                word_one['cand']=word_one['cand']|word['cand']
                word_one['hl']=word_one['hl']|word['hl']
                word_one['hot']=word_one['hot']|word['hot']
            }
        });
        if(!exist){
            cw_len=list.length;
            if(cw_len==0||list[cw_len-1]['text'].length>=word['text'].length){
                list.push(word);
            }
            else{
                insert_index=0;
                while(insert_index<=cw_len&&list[insert_index]['text'].length>word['text'].length){
                    insert_index+=1;
                }
                list.splice(insert_index,0,word);
            }
        }
    }
    function createCardRow(text){
        return '<p>'+text+'</p>';
    }
    function createKnowRow(match_one){
        html_str= '<div class="alert alert-primary" role="alert"><p>查询语句：'+match_one.match_str+'</p>';
        match_one.answer_list.forEach(function(ans0,index0,array0){
            html_str+='<p>答案['+(index0+1)+']：[';
            ans0[0].forEach(function(ans1,index1,array1){
                html_str+=ans1[2]+'='+ans1[0];
                if(index1<array1.length-1)
                    html_str+='，';
            });
            html_str+=']；实体匹配度='+ans0[1]+'</p>';
        });
        html_str+='</div>';
        return html_str;
    }
    function createRow(text,putin) {
    var $row=null;
    if(putin==0){

      $row = $('<div class="row"><div class="col-12 mt5" style="text-align:right;"><span class="btn btn-success chat-span" >'+text+'</span></div></div>');
    }else{
        $('#reward_div').remove();
        var response_html='<div class="row"><div class="col-12 mt5" style="text-align:left;"><span class="btn btn-primary chat-span" >'+text+'</span></div>';
        if(show_reward){
        response_html+='<div id="reward_div" class="col-6" style="text-align:left;">这个回答对您有帮助吗？<button id="reward_yes" class="btn btn-xs btn-outline-success" >是</button>'+
          '<button id="reward_no" class="btn btn-xs btn-outline-secondary" >否</button>'+
          '<button id="reward_nomore" class="btn btn-xs btn-outline-secondary" >不再提示</button></div></div>';
        }
        $row = $(response_html);
    }
    $chatlog.append($row);

    $('#reward_yes').click(function(){
      $('#reward_div').empty();
      $('#reward_div').text('感谢您的反馈！');
      var inputData = {
        'reward': 1
      }
      $.post(chatterbotUrl,inputData);
      setTimeout(function () {
        $('#reward_div').remove();
      }, 1000);
    });
    $('#reward_no').click(function(){
      $reward_text=$('<div class="input-group input-group-sm mt2">'+
          '<input type="text" id="reward_text" class="form-control" placeholder="您认为更好的回复..."/>'+
          '<span class="input-group-btn"><button id="reward_submit" class="btn btn-primary">提交</button></span></div>');
      $('#reward_div').append($reward_text);
      $('#reward_submit').click(function(){
        var inputData = {
          'reward': 0,
          'reward_text': $('#reward_text').val()
        }
        $.post(chatterbotUrl,inputData);
        $('#reward_div').empty();
        $('#reward_div').text('感谢您的反馈！');
        setTimeout(function () {
          $('#reward_div').remove();
        }, 1000);
      });
    });
    $('#reward_nomore').click(function(){
      show_reward=false;
      $('#reward_div').remove();
    });
    }

    function submitInput() {
    if(!canSubmit||$input.val()==''){
        return;
    }
    canSubmit=false;
    $sayButton.attr('disabled',"true")
    var inputData = {
      'text': $input.val()
    }

    // Display the user's input on the web page
    //createRow(inputData.text,0);

    var $submit = $.post(chatterbotUrl,inputData,function(json){
      createCollapse(inputData.text,json);
      $input.val('');
      $chatlog[0].scrollTop = $chatlog[0].scrollHeight;
      $sayButton.removeAttr("disabled");//将按钮可用
      $sayButton.text('提问');
      canSubmit=true;
    });

    <!--$submit.fail(function() {-->
      <!--// TODO: Handle errors-->
      <!--$sayButton.text('提问');-->
      <!--$sayButton.removeAttr("disabled");//将按钮可用-->
      <!--canSubmit=true;-->
    <!--});-->
    }

    $sayButton.click(function() {
    $sayButton.text('处理中..');
    $sayButton.attr({"disabled":"disabled"});
    submitInput();
    });


    $input.keydown(function(event) {
    // Submit the input when the enter button is pressed
    if (event.keyCode == 13) {
      submitInput();
    }
    });

