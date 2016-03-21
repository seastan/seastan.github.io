import sys
import re

reNewGame  = re.compile('Starting Game')
reNewTurn  = re.compile('Turn ([0-9]+)')
reRevealed = re.compile("adds '(.+)' to the staging area")
reDrawn    = re.compile("draws '(.+)'")
rePlayed   = re.compile("moves '(.+)' to Table")
reDiscarded= re.compile("discards '(.+)'")


allRevealed=[]
allDrawn=[]
allPlayed=[]
allDiscarded=[]

turnRevealed=[]
turnDrawn=[]
turnPlayed=[]
turnDiscarded=[]

def parse(logFile):
    with open(logFile) as f:
        for line in f:
            if reNewGame.search(line):
                print "Starting game"
                allRevealed=[]
                allDrawn=[]
                allPlayed=[]
                allDiscarded=[]
                turnRevealed=[]
                turnDrawn=[]
                turnPlayed=[]
                turnDiscarded=[]
            match = reNewTurn.search(line)
            if match is not None:
                print "Drawn: "+', '.join(turnDrawn)
                print "Revealed: "+', '.join(turnRevealed)
                print "Turn "+match.group(1)
                turnRevealed=[]
                turnDrawn=[]
                turnPlayed=[]
                turnDiscarded=[]
                
            match = reRevealed.search(line)
            if match is not None:
                card = match.group(1)
                allRevealed.append(card)
                turnRevealed.append(card)

            match = reDrawn.search(line)
            if match is not None:
                card = match.group(1)
                if card!='Card':
                    allDrawn.append(card)
                    turnDrawn.append(card)
            


# First argument is a text file of the Octgn quest log
parse(sys.argv[1])
