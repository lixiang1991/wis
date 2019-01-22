from django.template.loader import get_template
from django.template import Context
from django.views.generic import View
from core.rules import RuleList, Rule
from core.docs import Doc
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render_to_response
import datetime
import common.LogManager as LogManager
logger = LogManager.getLog()

class BaseView(object):
    rule_list = RuleList()


class RuleView(BaseView, View):
    def post(self, request, *args, **kwargs):
        result = {'success': 1}
        try:
            rule = Rule(request.POST)
            self.rule_list.update_rule(rule)
        except:
            logger.exception('格式化规则数据出错')
            result = {'success': 0}
        return JsonResponse(result)

    def get(self, request, *args, **kwargs):
        return JsonResponse({1: 10})

class DocView(BaseView,View):
    def post(self, request, *args, **kwargs):
        result = {'success': 1}
        try:
            doc = Doc(request.POST)
            result['marked_sentences']=doc.match_rule(self.rule_list)
        except:
            logger.exception('鉴定时遇到问题：')
            result = {'success': 0}
        return JsonResponse(result)


def main(request):
    now = datetime.datetime.now()
    return render_to_response('app.html', {'current_date': now})
