var thisPlayer = "";
var socket;

window.onload = function(e){
    socket = io.connect();
    socket.on("connect", () =>{
        socket.emit("join", "hi");
    })


    socket.on("joined", (data) =>{
        console.log(data);
        thisPlayer = data;
        console.log(socket.id);
    })

    socket.on("disconnect", ()=>{
        socket.emit("disconnect");
    })

    socket.on("opponentMove", (data) =>{
        document.getElementById(data.position).textContent = data.player;
    })

    document.querySelectorAll("td").forEach(e => e.addEventListener("click", function(event){
       console.log(this.textContent);
       if (this.textContent != ""){
           return;
       }
       this.textContent = thisPlayer;
       socket.emit("move", {
            player: thisPlayer,
            position: this.id
       })
    }))
}

