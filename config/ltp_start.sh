data_dir="/home/ubuntu/ltp-3.4.0/ltp_data/"
echo ${data_dir}cws.model
./ltp_server --segmentor-model ${data_dir}cws.model --segmentor-lexicon ${data_dir}cws.lex --postagger-model ${data_dir}pos.model --postagger-lexicon ${data_dir}pos.lex --ner-model ${data_dir}ner.model --parser-model ${data_dir}parser.model --srl-model ${data_dir}pisrl.model
