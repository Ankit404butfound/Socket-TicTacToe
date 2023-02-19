from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, send

import secrets


app = Flask(__name__, static_folder="")
app.config["SECRET"] = "secret"

gameDict = {}
currentUser = "O"

socket = SocketIO(app, cors_allowed_origins="*")


@app.route("/")
def index():
    return render_template("index.html")


@socket.on("createGame")
def createGame():
    sid = request.sid
    gameId = secrets.token_hex(1)
    gameDict[gameId] = {"players": [sid], sid: "X"}
    returnJson = {"gameId": gameId, "player": "X"}
    socket.emit("gameCreated", returnJson, room=sid)


@socket.on("joinGame")
def joinGame(data):
    gameId = data["gameId"]
    sid = request.sid
    if gameId in gameDict:
        opponent = gameDict[gameId]["players"][0]
        gameDict[gameId]["players"].append(sid)
        gameDict[gameId][sid] = "O"
        gameDict[gameId]["opponents"] = {sid: opponent, opponent: sid}
        returnJson = {"gameId": gameId, "player": "O"}
        socket.emit("opponentJoined", returnJson, room=opponent)
        socket.emit("successJoin", returnJson, room=sid)
    else:
        socket.emit("error", {"msg": "Invalid Game ID"}, room=sid)

    # player = ""
    # if gameDict:
    #     player = "O"
    #     socket.emit("opponentJoined")
    # else:
    #     player = "X"
    # gameDict[request.sid] = player
    # print(gameDict)
    # socket.emit("joined", player, room=request.sid)


@socket.on("replay")
def replay(data):
    gameId = data["gameId"]
    players = gameDict[gameId]["players"]
    for i in players:
        returnJson = {"player": "X" if i == request.sid else "O"}
        socket.emit("replay", returnJson, room=i)
    


@socket.on("move")
def move(data):
    gameId = data["gameId"]
    opponent = gameDict[gameId]["opponents"][request.sid]
    returnJson = {"player": data["player"], "position": data["position"]}
    socket.emit("opponentMove", returnJson, room=opponent)



@socket.on("disconnect")
def disconnect():
    print("disconnected: ", request.sid)
    del gameDict[request.sid]
    print(gameDict)



def getOpponent(sid):
    for i in gameDict:
        if i != sid:
            return i


socket.run(app, debug=True, host="0.0.0.0", port=5000)

