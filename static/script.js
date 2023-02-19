var thisPlayer = "";
var socket = io.connect();
var thisPlayersTurn = false;
var opponentJoined = false;
var gameId = "";
var gameArray = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
];

const btnJoin = document.getElementById("btnJoin");
const btnCreate = document.getElementById("btnCreate");

document.getElementById("gameArea").querySelectorAll("td").forEach(e => e.addEventListener("click", function(event){
    console.log(this.textContent);
    if (this.textContent != "" || !thisPlayersTurn || !opponentJoined){
        return;
    }
    this.textContent = thisPlayer;
    document.getElementById("msg").innerText = "Opponent's move";
    gameArray[this.id[0]][this.id[1]] = thisPlayer;
    thisPlayersTurn = false;
    socket.emit("move", {
        player: thisPlayer,
        position: this.id,
        gameId: gameId
    })
    var winner = checkWinner();
    if (winner != ""){
        document.getElementById("msg").innerText = winner == "draw"? "Game draw!": `${winner} won the game`;
        return;
    }
}))

document.getElementById("btnReplay").addEventListener("click", function(){
    socket.emit("replay", {gameId: gameId});
    // thisPlayer = "X";
});

document.getElementById("gameArea").style.display = "none";
document.getElementById("btnReplay").style.display = "none";




btnCreate.addEventListener("click", function(){
    socket.emit("createGame");
});

btnJoin.addEventListener("click", function(){
    var gameId = prompt("Please enter Game ID");
    socket.emit("joinGame", {gameId: gameId});
    
});


// function addListenerToGameArea(){
//     document.getElementById("gameArea").querySelectorAll("td").forEach(e => e.addEventListener("click", function(event){
//         if (this.textContent != "" || !thisPlayersTurn || !opponentJoined){
//             return;
//         }
//         this.textContent = thisPlayer;
//         document.getElementById("msg").innerText = "Opponent's move";
        
//         thisPlayersTurn = false;
//         socket.emit("move", {
//             player: thisPlayer,
//             position: this.id,
//             gameId: gameId
//         })
//     }))
// }


function replay(data){
        gameArray = [
            ["", "", ""],
            ["", "", ""],
            ["", "", ""]
        ];
        thisPlayer = data.player;
        if (thisPlayer == "X"){
            thisPlayersTurn = true;
            document.getElementById("msg").innerText = "Your move";
        }
        else{
            thisPlayersTurn = false;
            document.getElementById("msg").innerText = "Opponent's move";
        }
        document.getElementById("gameArea").querySelectorAll("td").forEach(e => e.textContent = "");
}



function onGameCreated(data){
    console.log("Game Created");
    document.getElementById("userArea").style.display = "none";
    document.getElementById("gameArea").style.display = "";
    document.getElementById("btnReplay").style.display = "";
    // addListenerToGameArea();
    document.getElementById("msg").innerHTML = `Waiting for opponent to join<br><h6>Share Game ID: ${data.gameId}</h6>`;
    gameId = data.gameId;
    thisPlayer = data.player;
    
}


function onOpponentJoined(data){
    console.log("Opponent Joined");
    document.getElementById("msg").innerHTML = "Opponent Joined, Your move";
    thisPlayersTurn = true;
    opponentJoined = true;
}


function onSuccessJoin(data){
    console.log("Joined");
    document.getElementById("gameArea").style.display = "";
    document.getElementById("userArea").style.display = "none";
    document.getElementById("btnReplay").style.display = "";
    opponentJoined = true;
    // addListenerToGameArea();
    document.getElementById("msg").innerHTML = `Opponent's move`;
    thisPlayer = data.player;
    gameId = data.gameId;
}


function onOpponentMove(data){
    position = data.position;
    console.log(data);
    document.getElementById(position).textContent = data.player;
    gameArray[position[0]][position[1]] = data.player;
    var winner = checkWinner();
    if (winner != ""){
        document.getElementById("msg").innerText = winner == "draw"? "Game draw!": `${winner} won the game`;
        return;
    }
    thisPlayersTurn = true;
    document.getElementById("msg").innerText = "Your move";

}


function checkWinner(){
    for (var i = 0; i < 3; i++){
        if (gameArray[i][0] == gameArray[i][1] && gameArray[i][1] == gameArray[i][2] && gameArray[i][0] != ""){
            return gameArray[i][0];
        }
        if (gameArray[0][i] == gameArray[1][i] && gameArray[1][i] == gameArray[2][i] && gameArray[0][i] != ""){
            return gameArray[0][i];
        }
    }

    if (gameArray[0][0] == gameArray[1][1] && gameArray[1][1] == gameArray[2][2] && gameArray[0][0] != ""){
        return gameArray[0][0];
    }

    if (gameArray[0][2] == gameArray[1][1] && gameArray[1][1] == gameArray[2][0] && gameArray[0][2] != ""){
        return gameArray[0][2];
    }

    // Check for draw
    var draw = true;
    for (var i = 0; i < 3; i++){
        for (var j = 0; j < 3; j++){
            if (gameArray[i][j] == ""){
                draw = false;
                break
            }
        }
    }
    return draw ? "draw" : "";
}


socket.on("gameCreated", onGameCreated);
socket.on("opponentJoined", onOpponentJoined);
socket.on("successJoin", onSuccessJoin);
socket.on("opponentMove", onOpponentMove);
socket.on("replay", replay);
socket.on("error", (data) => {
    console.log(data);
    alert(data.msg);
    });





    // socket.on("joined", (data) =>{
    //     console.log(data);
    //     thisPlayer = data;
    //     if (thisPlayer == "X"){
    //         thisPlayersTurn = true;
    //     }
    //     console.log(socket.id);
    // })


    // socket.on("opponentJoined", () =>{
    //     console.log("Opponent Joined");
    //     opponentJoined = true;
    //     if (thisPlayer == "X"){
    //         document.getElementById("waitmsg").innerText = "Opponent Joined, Your move";
    //     }
    //     else{
    //         document.getElementById("waitmsg").innerText = "Opponent's move";
    //     }
    // });

    

    // socket.on("disconnect", ()=>{
    //     socket.emit("disconnect");
    // })

    // socket.on("opponentMove", (data) =>{
    //     document.getElementById(data.position).textContent = data.player;
    //     thisPlayersTurn = true;
    //     document.getElementById("waitmsg").innerText = "Your move";
    // })

    

    // document.querySelectorAll("td").forEach(e => e.addEventListener("click", function(event){
    //     console.log(this.textContent);
    //     if (this.textContent != "" || !thisPlayersTurn || !opponentJoined){
    //         return;
    //     }
    //     document.getElementById("waitmsg").innerText = "Opponent's move";
    //     this.textContent = thisPlayer;
    //     thisPlayersTurn = false;
    //     socket.emit("move", {
    //         player: thisPlayer,
    //         position: this.id
    //     })
    // }))


    // window.onload = function(e){
    
    //     socket.on("connect", () =>{
            
    //     })
    // }