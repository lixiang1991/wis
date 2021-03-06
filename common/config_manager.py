#! /usr/bin/python
# -*- coding: utf-8 -*-

import os
import sys
import traceback
import common.utils as utils

if utils.is_python_2():
    import ConfigParser
else:
    import configparser as ConfigParser

# 获取当前用户主目录路径～，“/home/用户名称”
home_dir = os.path.expanduser('~')

znxz_config_path = os.path.join(utils.get_project_path(), "config", "config.ini")


def get_config_values(section, option):
    """
    根据section和option获取配置文件中对应的值
    :param section: 配置文件中的section名称，即中括号内的值
    :param option: 配置文件中的option名称，即等号前的名称
    :return: 配置文件中section部分的option对应的值
    :raises:
        NoSectionError: 读取配置文件错误
    """
    config = ConfigParser.ConfigParser()
    try:
        if utils.is_python_2():
            config.read(znxz_config_path)
        else:
            config.read(znxz_config_path, encoding='utf8')
        return config.get(section=section, option=option)
    except ConfigParser.NoSectionError:
        print("Read {} file error!".format(znxz_config_path))
        traceback.print_exc()
        sys.exit(1)


def set_config_values(section, option, value):
    """
    根据section、option和value写入或更新配置文件中对应的值
    :param section: 配置文件中的section名称，即中括号内的值
    :param option: 配置文件中的option名称，即等号前的名称
    :param value: 配置文件中option对应的值
    :return: 是否设置成功
    :raises:
    """
    config = ConfigParser.ConfigParser()
    try:
        if utils.is_python_2():
            config.read(znxz_config_path)
            config.set(section, option, value)
            config.write(open(znxz_config_path, 'w'))
        else:
            config.read(znxz_config_path, encoding='utf8')
            config.set(section, option, value)
            config.write(open(znxz_config_path, 'w', encoding='utf8'))
    except:
        print("Write {} file error!".format(znxz_config_path))
        traceback.print_exc()
        sys.exit(1)
    return True


if __name__ == '__main__':
    result = get_config_values('mysql', 'port')
    print(result)
