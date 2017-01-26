#!/usr/bin/python
import os
import re
import xml.etree.ElementTree as ET
import csv
import json
from shutil import copyfile



def clean_string(s):
    code = [u"\u00fa",u"\u00e9",u"\u00f3",u"\u00c9",u"\u00ed",u"\u2019",u"\u00e1",u"\u2013"]
    repl = ["u","e","o","E","i","'","a","-"]
    for i,c in enumerate(code):
        s = s.replace(code[i],repl[i])
    return s


def clean_symbols(s):
    code = [u"\u00d2",u"\u00db",u"\u00da",u"\u00ca",u"\u00ce",u"\u00cc",u"\u00cf",u"u00cd",u"\u263a","$"]
    repl = ["Willpower","Attack","Defense","Spirit","Lore","Leadership","Tactics","Baggins","Fellowship","Threat"]
    for i,c in enumerate(code):
        s = s.replace(code[i],repl[i])
    return s

allcards=[]
copyfile("cards.json","cards.json.bak")
for folder in next(os.walk('../Lord-of-the-Rings/o8g/Sets'))[1]:
    tree = ET.parse('../Lord-of-the-Rings/o8g/Sets/'+folder+"/set.xml")
    root = tree.getroot()
    setname = root.get('name')
    if 'Custom' in setname: continue
    for card in root.getiterator('card'):
        validPlayerCard=True
        newcard = {}
        cardname = card.get('name')
        newcard["name"] = cardname
        name_norm = clean_string(cardname)
        newcard["name_norm"] = name_norm
        newcard["octgn"] = card.get('id')
        for property in card.getiterator('property'):
            pname = property.get('name').lower()
            pvalue = property.get('value')
            if (pname=='sphere'):
                if pvalue=='Leadership': pvalue = "1leadership"
                elif pvalue=='Tactics': pvalue = "2tactics"
                elif pvalue=='Spirit': pvalue = "3spirit"
                elif pvalue=='Lore': pvalue = "4lore"
                elif pvalue=='Neutral': pvalue = "5neutral"
                elif pvalue=='Baggins': pvalue = "6baggins"
                elif pvalue=='Fellowship': pvalue = "7fellowship"
                else: validPlayerCard=False;
            if (pname=='type'):
                if pvalue=='Hero': pvalue = "1hero"
                elif pvalue=='Ally': pvalue = "2ally"
                elif pvalue=='Attachment': pvalue = "3attachment"
                elif pvalue=='Event': pvalue = "4event"
                elif pvalue=='Side Quest': pvalue = "5quest"
                else: validPlayerCard=False;                
            if (pname=='text'):
                pvalue=clean_symbols(pvalue);
            if (pname=='unique'):
                pvalue = True
            if (pname=='attack'):
                pname = "strength"
            if (pname=='health'):
                pname = "hitpoints"
            if (pname=='card number'):
                pname = "no"
            if (pname=='willpower' or pname=='attack' or pname=='defense' or pname=='strength' or pname=='hitpoints' or pname=='cost' or pname=='no'): 
                try:
                    pvalue = int(pvalue)
                except ValueError:
                    pvalue = pvalue

            newcard[pname] = pvalue
        # Skip non-player cards
        if validPlayerCard==False: continue;
        # Set keywords to "" if not set
        if not newcard.get("keywords",""): newcard["keywords"]=""
        if not newcard.get("text",""): newcard["text"]=""
        if not newcard.get("traits",""): newcard["traits"]=""
        
        # Set full card text
        newcard["textc"] = newcard.get("keywords","")+"\n"+newcard.get("text","")
        # Set expansion
        newcard["setname"] = folder
        if (folder=="Core Set"): exp="core"
        elif (folder=="Khazad-dum"): exp="kd"
        elif ("Eilph" in folder): exp="tnie"
        elif (folder=="The Drowned Ruins"): exp="tdr2"
        else: exp = "".join(w[0] for w in folder.split()).lower()
        exp=exp.replace("-","")
        newcard["exp"] = exp
        
        # Set image url
        if (exp=="thohauh"): exp="ohauh" # Exceptions
        if (exp=="thotd"): exp="otd"
        base = "http://www.cardgamedb.com/forums/uploads/lotr/"
        num = newcard.get("no","")
        suffix = ""
        if exp=='tnie': suffix='MEC29_'+str(num)+".jpg"
        elif exp=='cs': suffix='MEC30_'+str(num)+".jpg"
        elif exp=='tac': suffix='MEC31_'+str(num)+".jpg"
        elif exp=='tlr': suffix='MEC38_'+str(num)+".jpg"
        elif exp=='twoe': suffix='MEC39_'+str(num)+".jpg"
        elif exp=='efmg': suffix='MEC40_'+str(num)+".jpg"
        elif exp=='ate': suffix='MEC41_'+str(num)+".jpg"
        elif exp=='ttor': suffix='MEC42_'+str(num)+".jpg"
        elif exp=='tbocd': suffix='MEC43_'+str(num)+".jpg"
        elif exp=='tdr': suffix='MEC44_'+str(num)+".jpg"
        elif exp=='tgh': suffix='MEC47_'+str(num)+".jpg"
        elif exp=='trd': suffix='MEC34_'+str(num).zfill(3)+".jpg"
        elif exp=='ttos': suffix='MEC45_'+str(num)+".jpg"
        elif exp=='tlos': suffix='MEC46_'+str(num)+".jpg"
        elif exp=='fots': suffix='MEC48_'+str(num)+".jpg"
        elif exp=='ttitd': suffix='MEC49_'+str(num)+".jpg"
        elif exp=='totd': suffix='MEC50_'+str(num)+".jpg"
        elif exp=='tdr2': suffix='MEC51_'+str(num)+".jpg"
        elif exp=='asoch': suffix='MEC52_'+str(num)+".jpg"
        elif exp=='tcoc': suffix='MEC53_'+str(num)+".jpg"
        elif exp=='tsoh': suffix='MEC55_'+str(num)+".jpg"
        elif exp=='tfotw': suffix='MEC54_'+str(num)+".jpg"
# ENTER NEW SETS HERE
#        elif exp=='': suffix='MEC_'+str(num)+".jpg"
        elif exp=='tdt': suffix = "-".join(w for w in name_norm.split()).lower()+"_the-dunland-trap_"+str(num)+".jpg"
        elif exp=='tit': suffix = "-".join(w for w in name_norm.split()).lower()+"-trouble-in-tharbad-"+str(num)+".jpg"
        elif exp=='ttt': suffix = "-".join(w for w in name_norm.split()).lower()+"-the-three-trials-"+str(num)+".jpg"
        else: suffix = "-".join(w for w in name_norm.split()).lower()+"-"+exp+".jpg"

        newcard["img"] = base+suffix
        

        # Categories
        cat = ""
        tl = newcard.get("textc","").lower()
        if ('ready' in tl): cat=cat+"Readying, " 
        if ('shadow' in tl): cat=cat+"Shadow Control, " 
        if ('draw' in tl): cat=cat+"Card Draw, " 
        if ('search' in tl): cat=cat+"Card Seach, "
        if ('cannot attack' in tl): cat=cat+"Combat Control, "
        if ('condition' in tl): cat=cat+"Condition Control, "
        if ('discard' in tl and 'hand' in tl): cat=cat+"Discard from Hand, "
        if ('discard pile' in tl): cat=cat+"Discard Pile, "
        if ('encounter' in tl): cat=cat+"Encounter Control, "
        if ('look at' in tl and 'encounter' in tl): cat=cat+"Encounter Scrying, "
        if ('heal' in tl): cat=cat+"Healing, "
        if ('leaves play' in tl): cat=cat+"Leaves Play, "
        if ('location' in tl): cat=cat+"Location Control, "
        if ('put' in tl and 'into play'): cat=cat+"Mustering, "
        if ('look' in tl and 'deck' in tl and ('your' in tl or 'his' in tl or "player's" in tl)): cat=cat+"Player Deck Scrying, "
        if ('quest action' in tl): cat=cat+"Quest Action, "
        if ('return' in tl or ('discard pile' in tl and 'hand' in tl)): cat=cat+"Recursion, "
        if ('resource' in tl and ('add' in tl or 'additional' in tl)): cat=cat+"Resource Acceleration, "
        if ('resource' in tl and 'move' in tl): cat=cat+"Resource Smoothing, "
        if ('resource' in tl and 'icon' in tl and 'gains' in tl): cat=cat+"Resource Smoothing, "
        if ('secrecy' in tl or '20' in tl): cat=cat+"Secrecy, "
        if ('staging area' in tl and 'attack' in tl): cat=cat+"Staging Area Attack, "
        elif ('staging area' in tl): cat=cat+"Staging Area Control, "
        if ('less than' in tl and 'engagement cost' in tl): cat=cat+"Surprise, "
        if ('threat' in tl and ('reduce' in tl or 'lower' in tl)): cat=cat+"Threat Control, "
        if ('valour' in tl): cat=cat+"Valour, "
        if ('victory display' in tl): cat=cat+"Victory Display, "
 
        if (re.search("\+[0-9]+ attack",tl)): cat=cat+"Attack Bonus, "
        if (re.search("\+[0-9]+ defense",tl)): cat=cat+"Defense Bonus, "
        if (re.search("\+[0-9]+ willpower",tl)): cat=cat+"Willpower Bonus, "
        if (re.search("\+[0-9]+ hit point",tl)): cat=cat+"Hit Point Bonus, "
        if (re.search("deal [0-9]+ damage",tl)): cat=cat+"Direct Damage, "
        newcard["Categories"]=cat

        # Only allow player card types, including side quests, but not side quests that belong to an encounter set. 
        cardtype = newcard.get("type","")
        if (cardtype!='1hero' and cardtype!='2ally' and cardtype!='3attachment' and cardtype!='4event' and cardtype!='5quest'): continue
        if (newcard.get("encounter set","")): continue
#        if (newcard.get("name","") != "Bard the Bowman"): continue
        allcards.append(newcard)				

# for card in allcards:
#      print json.dumps(card, sort_keys=True, indent=4, separators=(',', ': '))

with open('cards.json', 'w') as outfile:
    json.dump(allcards, outfile, indent=4)
