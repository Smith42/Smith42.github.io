let colour = ["#77ff77","#ff6961","#fc107f","#02897e","aqua", "white"];
let bannerSpeed = 0.1;
window.addEventListener("load",start);

async function start(){
    const banData = await fetch("/banner.json");
    let ban = await banData.json();
    let projData = await fetch("/project.json");
    let proj = await projData.json();

    // Create audio element for secret click
    const secretSound = new Audio('fun/imp.mp3');
    
    // Add click listener to catch all banner clicks
    document.addEventListener('click', (e) => {
        if (e.target.textContent === "Secrets await") {
            e.preventDefault();
            secretSound.cloneNode().play();
        }
    });

    document.querySelector("#arrowCont").addEventListener("click",scrollDn);

    banner(ban);
    project(proj);  
    initFloaters();
}

function initFloaters() {
    const container = document.getElementById('float-container');

    // Add probability to each image (numbers represent relative weights)
    const imageConfig = [
        { src: 'fun/toast.gif', rotate: false, probability: 0.55 },
        { src: 'fun/shoggoth_telescope.png', rotate: true, probability: 0.4 },
        { src: 'fun/sunGlassesGalaxy.png', rotate: true, probability: 0.05 },
    ];

    function selectRandomImage() {
        const random = Math.random();
        let sum = 0;

        for (const image of imageConfig) {
            sum += image.probability;
            if (random < sum) {
                return image;
            }
        }
        return imageConfig[0]; // fallback to first image
    }

    function createFloater() {
        const floater = document.createElement('div');
        floater.className = 'floater';

        const duration = 25 + Math.random() * 10;
        const startY = Math.random() * 100;
        const startRotation = Math.random() * 360;
        const rotations = 2 + Math.random() * 4;

        // Use new selection function instead of random index
        const imageInfo = selectRandomImage();

        if (imageInfo.rotate) {
            const endRotation = startRotation + (360 * rotations);
            floater.style.animation = `fly-rotate ${duration}s linear forwards`;
            floater.style.setProperty('--start-rotation', `${startRotation}deg`);
            floater.style.setProperty('--end-rotation', `${endRotation}deg`);
        } else {
            floater.style.animation = `fly-straight ${duration}s linear forwards`;
        }

        floater.style.right = '-100px';
        floater.style.top = `${startY}%`;

        const img = document.createElement('img');
        img.src = imageInfo.src;
        floater.appendChild(img);

        container.appendChild(floater);

        setTimeout(() => {
            floater.remove();
        }, duration * 1000);
    }

    // Create initial floaters
    for (let i = 0; i < 3; i++) {
        setTimeout(() => createFloater(), i * 500);
    }

    setInterval(() => {
        if (container.children.length < 5) {
            createFloater();
        }
    }, 2000);
}

function banner(ban) {
    // Horizontal banner containers
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

    // Vertical banner containers
    const contLeft = document.querySelector("#banLeft");
    const innerLeft1 = document.createElement("div");
    innerLeft1.id = "innerLeft1";
    innerLeft1.classList = "inner-vertical";
    const innerLeft2 = document.createElement("div");
    innerLeft2.id = "innerLeft2";
    innerLeft2.classList = "inner-vertical";
    const contRight = document.querySelector("#banRight");
    const innerRight1 = document.createElement("div");
    innerRight1.id = "innerRight1";
    innerRight1.classList = "inner-vertical";
    const innerRight2 = document.createElement("div");
    innerRight2.id = "innerRight2";
    innerRight2.classList = "inner-vertical";

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
    let p = [pt1, pt2, pt3, pt4, pt5, pt6, pb1, pb2, pb3, pb4, pb5, pb6];
    let top = [pt1, pt2, pt3, pt4, pt5, pt6];
    let bottom = [pb1, pb2, pb3, pb4, pb5, pb6];
    let privRand = 0;

    //add attribute to every p
    for (item of p) {
        item.classList.add("move");
    }

    //append top to top banner
    let num = 0;
    for (item of top) {
        // Random colour gen
        rand = Math.floor(Math.random() * colour.length);
        if (rand == privRand && rand == 0) {
            rand += 1;
        } else if (rand == privRand) {
            rand -= 1;
        }
        if (num == top.length - 1 && colour[rand] == top[0].style.colour) {
            rand > 0 ? rand = rand - 1 : rand = rand + 1;
        }
        privRand = rand;
        // text content gen
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

    num = ban.length - 1;
    //append bottom to bottom banner
    for (item of bottom) {
        rand = Math.floor(Math.random() * colour.length);
        if (rand == privRand && rand == 0) {
            rand += 1;
        } else if (rand == privRand) {
            rand -= 1;
        }
        if (num == bottom.length - 1 && colour[rand] == bottom[0].style.colour) {
            rand > 0 ? rand = rand - 1 : rand = rand + 1;
        }
        item.textContent = ban[num].text;
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

    // Left vertical banner
    for (let i = 0; i < ban.length; i++) {
        let item = ban[i];

        rand = Math.floor(Math.random() * colour.length);
        if (rand == privRand && rand == 0) {
            rand += 1;
        } else if (rand == privRand) {
            rand -= 1;
        }
        privRand = rand;

        let link = document.createElement("a");
        link.textContent = item.text;
        link.href = item.link;
        link.style.color = colour[rand];

        let clone = link.cloneNode(true);

        innerLeft1.appendChild(link);
        innerLeft2.appendChild(clone);
    }

    // Right vertical banner (reverse order)
    for (let i = ban.length - 1; i >= 0; i--) {
        let item = ban[i];

        rand = Math.floor(Math.random() * colour.length);
        if (rand == privRand && rand == 0) {
            rand += 1;
        } else if (rand == privRand) {
            rand -= 1;
        }
        privRand = rand;

        let link = document.createElement("a");
        link.textContent = item.text;
        link.href = item.link;
        link.style.color = colour[rand];

        let clone = link.cloneNode(true);

        innerRight1.appendChild(link);
        innerRight2.appendChild(clone);
    }

    // Append vertical banners
    contLeft.appendChild(innerLeft1);
    contLeft.appendChild(innerLeft2);
    contRight.appendChild(innerRight1);
    contRight.appendChild(innerRight2);
}
function project(proj){
    const cont = document.querySelector("main");
    let animDelay = 0; 
    let privRand = 0   
    let num = proj.length-1;
    for (item of proj){
        const div = document.createElement("div");
        div.classList = "proj";
        div.id = item.id || item.title;

        const info = document.createElement("div");
        info.classList = "projInfo";
        
        const pCont = document.createElement("div");
        pCont.classList = "pCont";

        //git Link and Img
        const gitLink = document.createElement("a");
        gitLink.href = item.gitLink || item.thesisLink;
        gitLink.classList = "gitLink";
        const git = document.createElement("img");
        git.classList = "gitImg";
        git.src = item.gitLink ? "img/github.png" : "img/gradCap.png";
        //arxiv link and img
        const arxivLink = document.createElement("a");
        arxivLink.classList = "arxivLink";
        arxivLink.href = item.pLink;
        const arxiv = document.createElement("img");
        arxiv.src = "img/arxiv.ico";
        arxiv.classList = "arxivImg";
        //blog link and img
        const blogLink = document.createElement("a");
        blogLink.classList = "blogLink";
        blogLink.href = item.blogLink;
        const blog = document.createElement("img");
        blog.src = "img/blog.png";
        blog.classList = "blogImg";
        
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
            // pLink is for arxiv
            arxivLink.appendChild(arxiv);
            //gitLink.classList = "gitLink gitLinkMul";
        }
        if(item.gitLink != ""){
            gitLink.appendChild(git);
        }
        if(item.blogLink != ""){
            blogLink.appendChild(blog);
        }
        pCont.appendChild(p);
        pCont.appendChild(arxivLink);
        pCont.appendChild(gitLink);
        pCont.appendChild(blogLink);
        info.appendChild(pCont);
        if(item.img){
            info.appendChild(img);
        }
        div.appendChild(info);
        // link.appendChild(div);
        cont.appendChild(div);
    }
}
function scrollDn(e){
    const pageHeight = window.innerHeight-40;
    window.scrollBy(0,pageHeight);
}
