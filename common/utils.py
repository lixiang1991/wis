# -*- coding: utf-8 -*-

"""
@author: 龙婧;李翔
@time: 2018-7-25;2018-09-07
文件名: utils.py
主要用途: 提供文件读取、路径获取等静态公共方法。本项目中的文件存放路径已固化。
使用方法：
"""

import os
import re
import sys
import time
space_clean_re = re.compile('\s')
text_clean_re = re.compile('[\s\\\\\']')
sent_re = re.compile(u'([。；？！])')


# 通过读配置文件获取工程的路径
def get_project_path():
    """
    基本描述：获取工程路径
    详细描述：获取本工程路径，首先获取当前utils.py文件的绝对路径，向上两级找到工程路径。
    属性说明：
    Returns：获取本工程路径字符串
    """
    return os.path.dirname(os.path.dirname(os.path.realpath(__file__)))


def get_sys_type():
    """
    posix表示类Unix或OS X系统。nt表示windows系统
    :return:
    """
    if os.name == 'nt':
        return 1
    else:
        return 0


def get_sys_encoding():
    """
    获取系统的默认编码格式，主要影响文件名的输出
    :return:
    """
    if get_sys_type():
        return 'gbk'
    else:
        return 'utf8'


def get_pyltp_version():
    """
    #在windows系统用pyltp1.9版本，version=1
    #在ubuntu系统用pyltp2.0版本，version=2
    :return:
    """
    if get_sys_type() and is_python_2():
        return 1
    else:
        return 2


def is_python_2():
    if sys.version_info < (3, 5):
        return True
    else:
        return False
def decode_utf8(string):
    if is_python_2():
        return string.decode('utf8')
    else:
        return string
def get_cn_str_len(len):
    #对于str类型的字符，python2中一个汉字的长度为3，python3中一个汉字的长度为1
    if is_python_2():
        return len*3
    else:
        return len
def free_port(port):
    import traceback
    if get_sys_type():
        # win
        comm_netstat = 'netstat -an | findstr :'
    else:
        # ubuntu
        comm_netstat = 'netstat -ap | grep '
    try:
        lines = os.popen(comm_netstat + str(port)).readlines()
        if lines:
            print('端口%s被占用' % port)
            import signal
            line = lines[0]
            line = line[:line.rfind('/')]
            pid = line[line.rfind(' ') + 1:]
            if len(pid) > 0:
                os.kill(int(pid), signal.SIGKILL)
                print('进程%s被杀死' % pid)
        else:
            print('端口%s可以使用' % port)
    except:
        print('netstat 无法使用')
        traceback.print_exc()

def split_sentence(content):
    """
    按照句号等分割成若干个句子
    :param content:
    """
    last_sent = ''
    sentences = []
    splits = sent_re.split(content)
    for ss in splits:
        if not sent_re.search(ss):
            last_sent = ss.strip()
        else:
            # 找到了句号，把整句内容和句号合并存储。
            # 太短的句子直接舍弃
            if len(last_sent) > 3:
                sentences.append(last_sent + ss)
            last_sent = ''
    if len(last_sent) > 3:
        sentences.append(last_sent)
    return sentences

def long_sentence_split(sentence):
    """
    超长语句分割，如果句子太长，进行句法分析会exit code 139 (interrupted by signal 11: SIGSEGV)
    :param sentence:
    """
    sen_len = len(sentence)
    min_split_count = 1500
    result = []
    if sen_len > min_split_count:
        # 分割后的语句每个长度都不超过each_count
        each_count = 1000
        split_indexs = []  # 逗号的大概位置
        split_index = each_count
        while split_index < sen_len:
            dou_index = sentence.rfind(u'，', split_index - each_count, split_index)
            split_indexs.append(dou_index)
            split_index += each_count
        # 逗号的位置用在前面的截取
        for i, split_index in enumerate(split_indexs):
            if i == 0:
                start = 0
            else:
                start = split_indexs[i - 1] + 1
            result.append(sentence[start:split_index])
        # 最后一个截取
        result.append(sentence[split_indexs[-1] + 1:])
    else:
        result.append(sentence)
    return result


def clean_text(text, clean_zhuanyi=True):
    try:
        text = text.strip()
        text = text.replace("\\", "\\\\")
        text = text.replace("\'", "\\\'")
        text = text.replace("\"", "\\\"")
        if is_python_2():
            text = text.decode('utf8')
        if clean_zhuanyi:
            text = text_clean_re.sub('', text)
    except:
        pass
    return text


def full2half(string):
    """
    全角符号转为半角符号
    :param s: 原字符串
    :return: 转换后的字符串
    """
    n = []
    try:
        string = string.decode('utf-8')
    except:
        pass
    for char in string:
        num = ord(char)
        if num == 0x3000:
            num = 32
        elif 0xFF01 <= num <= 0xFF5E:
            num -= 0xfee0
        num = unichr(num)
        n.append(num)
    return ''.join(n)


def current_date():
    now = int(time.time())
    # 转换为其他日期格式,如:"%Y-%m-%d %H:%M:%S"
    timeStruct = time.localtime(now)
    return time.strftime("%Y-%m-%d", timeStruct)
if is_python_2():
    myopen = open
else:
    myopen = lambda i, j: open(i, j, encoding='utf-8')

if __name__ == "__main__":
    s = "2018-10-12 10:04:27    LoadPrj:c:\program files (x86)\kingview\example\kingdemo2\project.pro"
    s = clean_text(s)
    print(s)
    ss = '' + s
    print(ss)
