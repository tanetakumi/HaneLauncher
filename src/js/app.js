// 背景画像をメインプロセスに言われるがままに変更
window.api.on('bgimage', (event, file)=>{
    //document.querySelector('body').style.backgroundImage = `url(images/backgrounds/${rnd}.jpg)`
    document.querySelector('body').style.backgroundImage = `url(${file})`
});