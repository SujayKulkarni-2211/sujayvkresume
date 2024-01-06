let boxes=document.querySelectorAll(".box");
let resetbtn=document.querySelector("#resetbtn");
let newgamebtn=document.querySelector("#newgamebtn");
let turnX = true;
let msgContainer = document.querySelector(".msgcontainer");
let msg = document.querySelector("#msg");
let winner;
let clickSound = document.getElementById("clickSound");
msgContainer.classList.add("hide");
let winsound = document.getElementById("winsound");

const winPatterns = [
    [0,1,2],
    [0,3,6],
    [0,4,8],
    [1,4,7],
    [2,4,6],
    [2,5,8],
    [3,4,5],
    [6,7,8]
];
boxes.forEach((box)=>{
    box.addEventListener("click",()=>
   {
    if(turnX)
    {box.innerText= "X";
    box.classList.remove("o");
    box.classList.add("x");
    turnX=false;
    }  else {
        box.innerText = "O";
        box.classList.remove("x");
        box.classList.add("o");
        turnX= true;

    }
    box.disabled=true;
    playClickSound();
    checkWin(); 
   } );
});
function playClickSound() {
    clickSound.currentTime = 0; 
    clickSound.play();
}
function playWinSound(){
    winsound.currentTime = 0;
    winsound.play();
}

function checkWin(){
   for (let pattern of winPatterns) {
        let pos1val= boxes[pattern[0]].innerText;
        let pos2val= boxes[pattern[1]].innerText;
        let pos3val= boxes[pattern[2]].innerText;
        
        if(pos1val !="" && pos2val!="" && pos3val!="")
        {
            if (pos1val===pos2val&&pos2val===pos3val){

                winner=pos1val;
                playWinSound();
                showWinner();
                
            }
        }
   } 
}
function showWinner(){
    
    msg.innerText = `Congratulations ${winner}! You win! `
    
    boxes.forEach((box) => {
        
        box.classList.add("hide");
        msg.classList.remove("hide");
    msgContainer.classList.remove("hide");;
        
    });
    disableboxes();
}
const  disableboxes = ()=>{
    for (let box of boxes) {
    box.disabled=true;
    
      
    }
    
}
const enableboxes = () =>{
    for(let box of boxes)
    {   
        box.classList.remove("hide");
        box.disabled=false;
        box.innerText="" ;
        msgContainer.classList.add("hide");
        msg.classList.add("hide")

    }
}

const resetgame=()=>{
    turnX=true;
    enableboxes();

}
function newgame() {
    history.go()
}
newgamebtn.addEventListener("click",newgame);
resetbtn.addEventListener("click",resetgame);