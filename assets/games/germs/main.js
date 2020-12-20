const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    parent: 'phaser-example',
    scene: [ Boot, Preloader, MainMenu, MainGame, WaitingMenu ],
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    }
};
this.socket = io();
let game = new Phaser.Game(config);