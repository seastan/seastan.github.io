import json
from operator import itemgetter

exps=['core']
heroes=[]
spheres=[]
deck=[]

# allheroes=[]
# allallies=[]
# allattachments=[]
# allevents=[]
# allquests=[]

# Load card rankings
with open('rank_heroes.json') as cards_file:
    global allheroes
    allheroes = json.load(cards_file)
with open('rank_allies.json') as cards_file:
    global allallies
    allallies = json.load(cards_file)
with open('rank_attachments.json') as cards_file:
    global allattachments
    allattachments = json.load(cards_file)
with open('rank_events.json') as cards_file:
    global allevents
    allevents = json.load(cards_file)
with open('rank_quests.json') as cards_file:
    global allquests
    allquests = json.load(cards_file)

# Filer Cards by available sets
allheroes      = [ card for card in allheroes      if (card["exp"] in exps) ]
allallies      = [ card for card in allallies      if (card["exp"] in exps) ]
allattachments = [ card for card in allattachments if (card["exp"] in exps) ]
allallies      = [ card for card in allevents      if (card["exp"] in exps) ]
allquests      = [ card for card in allquests      if (card["exp"] in exps) ]

def add_hero():
    global allheroes
    herodict = max(allheroes, key=itemgetter('cardrank'))
    heroname = herodict["name_norm"]
    heroexp  = herodict["exp"]
    allheroes = [ hero for hero in allheroes if (hero["name_norm"]!=heroname or hero["exp"]!=heroexp) ]
    heroes.append(herodict)
    
def add_card():
    # Start with staples
    if 



while len(heroes)<3:
    add_hero()

for hero in heroes:
    spheres.append(hero["shpere"])

while len(deck)<50:
    add_card()

print heroes
print deck


