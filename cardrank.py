from __future__ import division
import os
import re
import csv
import json
from operator import itemgetter


with open('cards.json') as cards_file:
    cards = json.load(cards_file)

heroes=[]
allies=[]
attachments=[]
events=[]
quests=[]

# Sort cards
for card in cards:
    if card["type"]=="1hero": heroes.append(card.copy())
    if card["type"]=="2ally": allies.append(card.copy())
    if card["type"]=="3attachment": attachments.append(card.copy())
    if card["type"]=="4event": events.append(card.copy())
    if card["type"]=="5quest": quests.append(card.copy())

########################
###### Rank heroes #####
########################
# THIS IS DONE MANUALLY
heroranking=[
{"name_norm":"Glorfindel", "exp":"fos"},
{"name_norm":"Gandalf", "exp":"rd"},
{"name_norm":"Elrond", "exp":"saf"},
{"name_norm":"Arwen Undomiel", "exp":"tdr"},
{"name_norm":"Galadriel", "exp":"cs"},
{"name_norm":"Eowyn", "exp":"core"},
{"name_norm":"Beravor", "exp":"core"},
{"name_norm":"Sam Gamgee", "exp":"tbr"},
{"name_norm":"Theodred", "exp":"core"},
{"name_norm":"Balin", "exp":"thotd"},
{"name_norm":"Aragorn", "exp":"core"},
{"name_norm":"Frodo Baggins", "exp":"catc"},
{"name_norm":"Aragorn", "exp":"twitw"},
{"name_norm":"Haldir of Lorien", "exp":"tit"},
{"name_norm":"Boromir", "exp":"tdm"},
{"name_norm":"Mablung", "exp":"nie"},
{"name_norm":"Faramir", "exp":"tlos"},
{"name_norm":"Pippin", "exp":"tbr"},
{"name_norm":"Legolas", "exp":"core"},
{"name_norm":"Erkenbrand", "exp":"tac"},
{"name_norm":"Beregond", "exp":"hon"},
{"name_norm":"Beorn", "exp":"thohauh"},
{"name_norm":"Merry", "exp":"twoe"},
{"name_norm":"Bifur", "exp":"kd"},
{"name_norm":"Grima hero", "exp":"voi"},
{"name_norm":"Aragorn", "exp":"tlr"},
{"name_norm":"Amarthiul", "exp":"tbocd"},
{"name_norm":"Gimli", "exp":"core"},
{"name_norm":"Eomer", "exp":"voi"},
{"name_norm":"Idraen", "exp":"ttt"},
{"name_norm":"Eleanor", "exp":"core"},
{"name_norm":"Prince Imrahil", "exp":"ajtr"},
{"name_norm":"Gloin", "exp":"core"},
{"name_norm":"Thalin", "exp":"core"},
{"name_norm":"Denethor", "exp":"core"},
{"name_norm":"Glorfindel", "exp":"core"},
{"name_norm":"Halbarad", "exp":"tlr"},
{"name_norm":"Dunhere", "exp":"core"},
{"name_norm":"Bilbo Baggins", "exp":"thfg"},
{"name_norm":"Bard the Bowman", "exp":"thotd"},
{"name_norm":"Fatty Bolger", "exp":"tbr"},
{"name_norm":"Dwalin", "exp":"kd"},
{"name_norm":"Faramir", "exp":"aoo"},
{"name_norm":"Pippin", "exp":"eaad"},
{"name_norm":"Brand son of Bain", "exp":"thoem"},
{"name_norm":"Dori", "exp":"ate"},
# Deck specific heroes have the lowent rankings
{"name_norm":"Bombur", "exp":"thotd"},
{"name_norm":"Dain Ironfoot", "exp":"rtm"},
{"name_norm":"Thorin Oakenshield", "exp":"thohauh"},
{"name_norm":"Damrod", "exp":"tlos"},
{"name_norm":"Ori", "exp":"thohauh"},
{"name_norm":"Oin", "exp":"thotd"},
{"name_norm":"Elrohir", "exp":"trg"},
{"name_norm":"Elladan", "exp":"rtr"},
{"name_norm":"Hama", "exp":"tld"},
{"name_norm":"Treebeard", "exp":"tos"},
{"name_norm":"Boromir", "exp":"hon"},
{"name_norm":"Hirluin the Fair", "exp":"tsf"},
{"name_norm":"Mirlonde", "exp":"tdf"},
{"name_norm":"Caldara", "exp":"tbog"},
{"name_norm":"Theoden", "exp":"tmv"},
{"name_norm":"Merry", "exp":"tbr"},
{"name_norm":"Celeborn", "exp":"tdt"},
{"name_norm":"Rossiel", "exp":"efmg"},
{"name_norm":"Erestor", "exp":"ttor"},
{"name_norm":"Theoden", "exp":"tos"},
{"name_norm":"Nori", "exp":"thohauh"}
]

for hero in heroes:
    heroname=hero["name_norm"]
    heroexp =hero["exp"]
    # cardrank = number of heroes - position of hero in the herorank list
    heroposition = [i for i,x in enumerate(heroranking) if ((x["name_norm"]==heroname) and (x["exp"]==heroexp))]
    if not heroposition:
        cardrank=0
    else:
        cardrank=len(heroranking) - heroposition[0]
    hero['cardrank']=cardrank

heroes = sorted(heroes, key=itemgetter('cardrank'))
# for hero in heroes:
#     print hero["name_norm"],"\t",hero["cardrank"]

########################
##### Rank allies ######
########################

# Remove allies with non-numerical costs
allies = [ ally for ally in allies if (ally["cost"]!="-") ]

for ally in allies:
    if ally["cost"]=="-":
        allies.remove(ally)
        continue
    cost = ally["cost"]
    if (cost==0): cost=3
    stats = ally["willpower"]*2+ally["strength"]+ally["defense"]+ally["hitpoints"]
    if (ally["hitpoints"]>2): stats = stats-1
    cardrank = stats/cost
    ally['cardrank']=cardrank

allies = sorted(allies, key=itemgetter('cardrank'))
# #print sorted_cards
for ally in allies:
    print ally["name_norm"],"\t",ally["exp"]

########################
### Rank Attachments ###
########################

# Currently unranked

########################
##### Rank Events ######
########################

# Currently unranked




#-----------------------------
# Write ranked cards to file
#-----------------------------
with open('rank_heroes.json','w') as outfile:
    json.dump(heroes, outfile)
with open('rank_allies.json','w') as outfile:
    json.dump(allies, outfile)
with open('rank_attachments.json','w') as outfile:
    json.dump(attachments, outfile)
with open('rank_events.json','w') as outfile:
    json.dump(events, outfile)
with open('rank_quests.json','w') as outfile:
    json.dump(quests, outfile)

