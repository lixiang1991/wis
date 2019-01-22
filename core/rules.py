# -*- coding: UTF-8 -*-

class RuleList(object):
    def __init__(self):
        self.list={}
    def update_rule(self,rule):
        self.list[rule.id]=rule
class Rule(object):
    def __init__(self,json_dict):
        print(json_dict)
        self.id=json_dict['index']
        self.main_obj=json_dict['main_obj']#主体
        self.action=json_dict['action']#行为
        self.sub_obj=json_dict['sub_obj']#客体
        self.date=json_dict['date']#时间
        self.area=json_dict['area']#地点
        self.number_c=json_dict['number_c']#数值比较符号
        self.number_v=json_dict['number_v']#数值
        self.level=json_dict['level']#密级
