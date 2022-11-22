let col = ["#77ff77","#ff6961","#fc107f","#02897e","#ffffff"];
let moving=[
    {text:"wow",start:false,width:0,colour:col[0],dx:2,dy:2,x:window.innerWidth/2,y:window.innerHeight/3},
    {text:"such space",start:false,width:0,colour:col[1],dx:1,dy:-1,x:window.innerWidth/2,y:window.innerHeight/3},
    {text:"many nural network",start:false,width:0,colour:col[2],dx:1,dy:2,x:window.innerWidth/2,y:window.innerHeight/2},
    {text:"dip lern",start:false,width:0,colour:col[3],dx:-1,dy:3,x:window.innerWidth/2,y:window.innerHeight/2},
    {img:"fun/sunGlassesGalaxy.png",start:false,rot:2,dx:-1,dy:-1,x:window.innerWidth/2,y:window.innerHeight/4}
];
let funMode = false;
let animReq;

window.onload = () => {
    document.querySelector("#funify").addEventListener("click",funifyFunc);
    window.addEventListener("resize",resize);
}
function funifyFunc(e){
    const main = document.querySelector("main");
    const all = document.querySelectorAll("*");
    const funCont = document.querySelector("#funCont");
    const ctx = funCont.getContext("2d");
    const tog = document.querySelector("#funToggle");
    const off = document.querySelector("#funOff");
    const on = document.querySelector("#funOn");

    if(!funMode){
        on.style.right = 0;
        off.style.left = "-3rem";
        funCont.style.top = "0"
        funMode = true;
    }else{
        on.style.right = "-3rem";
        off.style.left = "0";
        funCont.style.top = "100%"
        funMode = false;
    }

    funCont.style.display = "block";

    const ban1 = document.querySelector("#ban1");
    const ban2 = document.querySelector("#ban2");
    // ban1.style.top = "-5rem";
    // ban2.style.bottom = "-5rem";
    if(funMode){
        document.body.style.background = "#02897e";
        document.body.style.animation = "backgroundFlash 2.50s alternate ease-in-out infinite";
        resize(moving);
        for(a of all){
            if(a.id != "funOff"){
                a.style.setProperty("font-family","'Comic Sans MS', 'Comic Sans'"); 
            }else{
            }
        }
        startConfetti();
        // ban1.style.setProperty("font-family","'Comic Sans MS', 'Comic Sans'","important");
        // body.style.fontFamily = "cursive";
    }
    else{
        document.body.style.background = "black";
        document.body.style.animation = "";
        ctx.clearRect(0,0,window.innerWidth,window.innerHeight)
        for(a of all){
            a.style.setProperty("font-family","");
        }
    }
}
function startConfetti(){
    const confettiCont = document.querySelector("#confettiCanvas") || document.createElement("canvas");
    confettiCont.id = "confettiCanvas";
    document.body.appendChild(confettiCont);
    confetti({
        particleCount: 100,
        angle: 66,
        spread: 55,
        origin: { x:0,y:.9}
    });
    confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x:1,y:.9}
    });

    setTimeout(() => {
        confetti.reset();
    }, 5000);
}
function draw(){
    const funCont = document.querySelector("#funCont");
    const ctx = funCont.getContext("2d");
    const imgCan = document.createElement("canvas");
    imgCan.width = 115;
    imgCan.height = 115;
    const imgCtx = imgCan.getContext("2d");
    
    const textHeight = 30;
    
    ctx.clearRect(0, 0, funCont.width, funCont.height);
    ctx.font = `${textHeight}px Comic Sans MS`;

    for (m of moving){
        ctx.fillStyle = m.colour || "#ffffff";

        let metrics = m.text ? ctx.measureText(m.text) : null;
        let width = m.width = metrics ? metrics.width : null;
        let image
        if (m.img){
            image = new Image();
            image.src = m.img
        }
        if(!m.start && m.y>100){
            m.start=true;
        }
        else if(!m.start){
            if(m.text){
                ctx.fillText(m.text,m.x+=m.dx,m.y+=m.dy);
            }else if(m.img){
                imgCtx.drawImage(image,0,0);
                ctx.drawImage(imgCan,m.x+=m.dx,m.y+=m.dy);
            }
        } 
        if(m.text && m.start){
            if((m.x + width > funCont.width) || (m.x <= 0)){
                m.dx=-m.dx
            }
            if((m.y > funCont.height-30) || (m.y < textHeight+30)){
                m.dy=-m.dy
            }
            ctx.fillText(m.text,m.x+=m.dx,m.y+=m.dy);
        }else if(m.img && m.start){
            if((m.x > funCont.width-115) || (m.x <= 0)){
                m.dx=-m.dx;
                m.flip=!m.flip;
            }
            if((m.y > funCont.height-145) || (m.y < 0 + 30)){
                m.dy=-m.dy
            }
            imgCtx.translate(imgCan.width/2,imgCan.height/2);
            imgCtx.rotate(m.rot * Math.PI/180);
            imgCtx.translate(-imgCan.width/2,-imgCan.height/2);
            m.rot++;
            imgCtx.drawImage(image,0,0);
            ctx.drawImage(imgCan,m.x+=m.dx,m.y+=m.dy);
        }
        
       
    }
    animReq = window.requestAnimationFrame(draw);

}
function resize(e){
    console.log(e);
    if(e.type == "resize"){
        for(m of moving){
            m.x = window.innerWidth/2-m.width/2;
        }
    }
    funCont.width=window.innerWidth;
    funCont.height=window.innerHeight;
    !animReq ? window.requestAnimationFrame(draw) : null;
}