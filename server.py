from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, send


app = Flask(__name__, static_folder="")
app.config["SECRET"] = "secret"

gameDict = {}
currentUser = "O"

socket = SocketIO(app, cors_allowed_origins="*")


@app.route("/")
def index():
    return render_template("index.html")


@socket.on("join")
def joinGame(data):
    print("connected: ", request.sid)
    player = ""
    if gameDict:
        player = "O"
    else:
        player = "X"
    gameDict[request.sid] = player
    print(gameDict)
    socket.emit("joined", player, room=request.sid)


@socket.on("move")
def move(data):
    for i in gameDict:
        if i != request.sid:
            opponent = i
    socket.emit("opponentMove", data, room=opponent)



@socket.on("disconnect")
def disconnect():
    print("disconnected: ", request.sid)
    del gameDict[request.sid]
    print(gameDict)


socket.run(app, debug=True, host="0.0.0.0", port=5000)

