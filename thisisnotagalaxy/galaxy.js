let imgLst = ["000.png", "001.png", "002.png", "003.png", "004.png", "005.png", "006.png", "007.png", "008.png", "009.png", "010.png", "011.png", "012.png", "013.png", "014.png", "015.png", "016.png", "017.png", "018.png", "019.png", "020.png", "021.png", "022.png", "023.png", "024.png", "025.png", "026.png", "027.png", "028.png", "029.png", "030.png", "031.png", "032.png", "033.png", "034.png", "035.png", "036.png", "037.png", "038.png", "039.png", "040.png", "041.png", "042.png", "043.png", "044.png", "045.png", "046.png", "047.png", "048.png", "049.png", "050.png", "051.png", "052.png", "053.png", "054.png", "055.png", "056.png", "057.png", "058.png", "059.png", "060.png", "061.png", "062.png", "063.png", "064.png", "065.png", "066.png", "067.png", "068.png", "069.png", "070.png", "071.png", "072.png", "073.png", "074.png", "075.png", "076.png", "077.png", "078.png", "079.png", "080.png", "081.png", "082.png", "083.png", "084.png", "085.png", "086.png", "087.png", "088.png", "089.png", "090.png", "091.png", "092.png", "093.png", "094.png", "095.png", "096.png", "097.png", "098.png", "099.png", "100.png", "101.png", "102.png", "103.png", "104.png", "105.png", "106.png", "107.png", "108.png", "109.png", "110.png", "111.png", "112.png", "113.png", "114.png", "115.png", "116.png", "117.png", "118.png", "119.png", "120.png", "121.png", "122.png", "123.png", "124.png", "125.png", "126.png", "127.png", "128.png", "129.png", "130.png", "131.png", "132.png", "133.png", "134.png", "135.png", "136.png", "137.png", "138.png", "139.png", "140.png", "141.png", "142.png", "143.png", "144.png", "145.png", "146.png", "147.png", "148.png", "149.png", "150.png", "151.png", "152.png", "153.png", "154.png", "155.png", "156.png", "157.png", "158.png", "159.png", "160.png", "161.png", "162.png", "163.png", "164.png", "165.png", "166.png", "167.png", "168.png", "169.png", "170.png", "171.png", "172.png", "173.png", "174.png", "175.png", "176.png", "177.png", "178.png", "179.png", "180.png", "181.png", "182.png", "183.png", "184.png", "185.png", "186.png", "187.png", "188.png", "189.png", "190.png", "191.png", "192.png", "193.png"];

window.addEventListener("load",init);

function init(){
    document.body.addEventListener("click",randomPic);
    randomPic();
}


function randomPic() {
    var num = Math.floor(Math.random()*imgLst.length);
    
    const imgCont = document.querySelector("#image");
    imgCont.innerHTML = "";
    const newImg = document.createElement("img");
    newImg.src = `galaxies/${imgLst[num]}`;

    imgCont.appendChild(newImg);
}
