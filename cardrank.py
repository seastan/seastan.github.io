from __future__ import division
import os
import re
import csv
import json
from operator import itemgetter


with open('cards.json') as cards_file:
    cards = json.load(cards_file)

allies=[]
for card in cards:
    if card["type"]=="2ally":
        print card["name"]
        if card["cost"]=="-": continue
        card['cost_per_stats']=card["cost"]/(card["willpower"]+card["strength"]+card["defense"]+(card["hitpoints"]-1))
        allies.append(card.copy())
#print cards
allies = sorted(allies, key=itemgetter('cost_per_stats'))
# #print sorted_cards
for ally in allies:
    print ally["name_norm"],"\t",ally["cost_per_stats"]


