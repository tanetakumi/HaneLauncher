// 背景画像をメインプロセスに言われるがままに変更
window.api.on('bgimage', (event, number)=>{
    document.querySelector('body').style.backgroundImage = `url(images/backgrounds/${number}.jpg)`
});