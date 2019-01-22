# -*- coding: UTF-8 -*-
import re

sent_re = re.compile('([。；？！])')
equal_re = re.compile('因(?P<word>.{1,6})死亡')


class Doc(object):
    def __init__(self, json_dict):
        self.content = json_dict['content']
        self.sentences = []
        splits = sent_re.split(self.content)
        last_sent = ''
        for hs in splits:
            if not sent_re.search(hs):
                last_sent = hs.strip()
            else:
                self.sentences.append(last_sent + hs)

    def match_rule(self, rule_list):
        marked_sentences = {}
        for i, sentence in enumerate(self.sentences):
            sentence = equal_re.sub('死于\g<word>', sentence)
            print(sentence)
            for id, rule in rule_list.list.items():
                marked_sent = {'score': 0.0}
                if rule.main_obj in sentence:
                    marked_sent['main_obj'] = rule.main_obj
                    marked_sent['score'] += 0.4
                if rule.action in sentence:
                    marked_sent['action'] = rule.action
                    marked_sent['score'] += 0.3
                if rule.date in sentence:
                    marked_sent['date'] = rule.date
                    marked_sent['score'] += 0.1
                if rule.area in sentence:
                    marked_sent['area'] = rule.area
                    marked_sent['score'] += 0.1
                if rule.number_v in sentence:
                    marked_sent['number'] = rule.number_v
                    marked_sent['score'] += 0.1
                marked_sent['score'] = float('%.2f' % marked_sent['score'])
                if marked_sent['score'] >= 0.7:
                    marked_sent['sentence'] = sentence
                    marked_sent['level'] = rule.level

                    marked_sentences[i] = marked_sent
                    print(marked_sent['score'])
        return marked_sentences


if __name__ == '__main__':
    sentence = '中国每年因吸烟死亡的人数超过100万'
    sentence = equal_re.sub('死于\g<word>', sentence)
    print(sentence)
