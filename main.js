let colour = ["#77ff77","#ff6961","#fc107f","#02897e","aqua", "white"];
let bannerSpeed = .5;
window.addEventListener("load",start);

async function start(){
    const banData = await fetch("/banner.json");
    let ban = await banData.json();
    let projData = await fetch("/project.json");
    let proj = await projData.json();
    document.querySelector("#arrowCont").addEventListener("click",scrollDn);

    banner(ban);
    project(proj);  
}

function banner(ban){
    const cont1 = document.querySelector("#ban1");
    const inner11 = document.createElement("div");
    inner11.id = "inner11";
    inner11.classList = "inner";
    const inner12 = document.createElement("div");
    inner12.id = "inner12";
    inner12.classList = "inner";
    const cont2 = document.querySelector("#ban2");
    const inner21 = document.createElement("div");
    inner21.id = "inner21";
    inner21.classList = "inner";
    const inner22 = document.createElement("div");
    inner22.id = "inner22";
    inner22.classList = "inner";

    //top p
    let pt1 = document.createElement("a");
    let pt2 = document.createElement("a");
    let pt3 = document.createElement("a");
    let pt4 = document.createElement("a");
    let pt5 = document.createElement("a");
    let pt6 = document.createElement("a");
    //bottom p
    let pb1 = document.createElement("a");
    let pb2 = document.createElement("a");
    let pb3 = document.createElement("a");
    let pb4 = document.createElement("a");
    let pb5 = document.createElement("a");
    let pb6 = document.createElement("a");
    //list of p
    let p = [pt1,pt2,pt3,pt4,pt5,pt6,pb1,pb2,pb3,pb4,pb5,pb6];
    let top = [pt1,pt2,pt3,pt4,pt5,pt6];
    let bottom = [pb1,pb2,pb3,pb4,pb5,pb6];
    let privRand = 0;
    //add attribute to every p
    for (item of p){
        item.classList.add("move");
    }
    //append top to top banner
    let num = 0;
    for (item of top){
        rand = Math.floor(Math.random()*colour.length);
        if (rand == privRand && rand == 0){
            rand += 1;
        }else if (rand==privRand){
            rand-=1;
        }
        if (num == top.length-1 && colour[rand] == top[0].style.colour){
            rand > 0 ? rand = rand-1 : rand = rand+1;
        }
        privRand = rand;
        item.textContent = ban[num].text;
        item.href = ban[num].link;
        item.style.color = colour[rand];
        item.style.colour = colour[rand];

        let clone = item.cloneNode(true);
        inner11.appendChild(item);
        inner12.appendChild(clone);
        cont1.appendChild(inner11);
        cont1.appendChild(inner12);
        num += 1;
    }
    num = ban.length-1;
    //append bottom to bottom banner
    for (item of bottom){
        rand = Math.floor(Math.random()*colour.length);
        if (rand == privRand && rand == 0){
            rand += 1;
        }else if (rand==privRand){
            rand-=1;
        }
        if (num == bottom.length-1 && colour[rand] == bottom[0].style.colour){
            rand > 0 ? rand=rand-1 : rand=rand+1;
        }
        item.textContent = ban[num].text
        item.href = ban[num].link;

        privRand = rand;
        item.style.color = colour[rand];
        item.style.colour = colour[rand];
        let clone = item.cloneNode(true);
        inner21.appendChild(item);
        inner22.appendChild(clone);
        cont2.appendChild(inner21);
        cont2.appendChild(inner22);
        num -= 1;
    }

}
function project(proj){
    const cont = document.querySelector("main");
    let animDelay = 0; 
    let privRand = 0   
    let num = proj.length-1;
    for (item of proj){
        const div = document.createElement("div");
        div.classList = "proj";
        div.id = item.title;
        
        const pCont = document.createElement("div");
        pCont.classList = "pCont";

        //git Link and Img
        const gitLink = document.createElement("a");
        gitLink.href = item.gitLink;
        gitLink.classList = "gitLink";
        const git = document.createElement("img");
        git.classList = "gitImg";
        git.src = "img/github.png";
        //arxiv link and img
        const arxivLink = document.createElement("a");
        arxivLink.classList = "arxivLink";
        arxivLink.href = item.pLink;
        const arxiv = document.createElement("img");
        arxiv.src = "img/arxiv.ico";
        arxiv.classList = "arxivImg";
        
        const h1 = document.createElement("h1");
        const p = document.createElement("p");
        const img = document.createElement("img");
        img.classList = "projImg"


        img.src = item.img;
        h1.textContent = item.title;
        h1.style.animationDelay = `${animDelay -= 0.25}s`;

        rand = Math.floor(Math.random()*colour.length);
        if (rand == privRand && rand == 0){
            rand += 1;
        }else if (rand==privRand){
            rand-=1;
        }
        div.style.borderColor = `${colour[rand]}` 
        privRand = rand;
        p.innerHTML = item.desc;

        div.appendChild(h1);
        if(item.pLink != ""){
            arxivLink.appendChild(arxiv);
            gitLink.classList = "gitLink gitLinkMul";
        }
        gitLink.appendChild(git);
        pCont.appendChild(p);
        pCont.appendChild(arxivLink);
        pCont.appendChild(gitLink);
        div.appendChild(pCont);
        div.appendChild(img);
        // link.appendChild(div);
        cont.appendChild(div);
    }
}
function scrollDn(e){
    const pageHeight = window.innerHeight-40;
    window.scrollBy(0,pageHeight);
}