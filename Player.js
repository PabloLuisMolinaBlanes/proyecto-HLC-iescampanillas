
class Player extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, isplayer2, socketid) {
        super(scene, x, y, 'assets', 'player');
        this.socketid;
        this.secondPlayer;
        this.iamsecondplayer = false;
        this.playerArray;
        this.interval;
        this.called = false;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCircle(14, 3, 6);
        this.setCollideWorldBounds(true);

        this.isAlive = false;
        this.speed = 280;
        this.rotation;
        this.target = new Phaser.Math.Vector2();
        if (isplayer2) {
            socket.emit('iamplayer2');
            socket.on('takethis', () => {
                if (this.iamsecondplayer === false) {
                    this.iamsecondplayer = true;
                    console.log("Took this");
                }
            })
        } else {
            socket.emit('placemyplayer', this, this.speed, this.target);
            
        }
    
    }
    start() {
        this.isAlive = true;
        if (this.iamsecondplayer === false && this.secondPlayer != null) {
            this.interval = setInterval(() => {socket.emit('updatemyplayertochecktostop', this, this.target);}, 300);
            this.scene.input.on('pointermove', (pointer) => {
                if (this.isAlive) {
                    this.target.x = pointer.x;
                    this.target.y = pointer.y;
                    //  Add 90 degrees because the sprite is drawn facing up
                    this.rotation = this.scene.physics.moveToObject(this, this.target, this.speed) + 1.5707963267948966;
                    socket.emit('updatemyplayer', this, this.target, this.speed, this.rotation);
                }
            });
        } else {
            if (this.iamsecondplayer) {
            } else {
                this.scene.add.bitmapText(400, 500, 'slime', 'Error, no players found!', 40).setOrigin(0.5);
            }
        }
        var firstTime = true;
        socket.on('checkifstopped', (player, target) => {
            if (this.iamsecondplayer === false) {
                if (this.secondPlayer.body.speed > 0 && this.secondPlayer.isAlive) {
                if (Phaser.Math.Distance.Between(player.x, player.y, target.x, target.y) < 6) {
                        this.secondPlayer.body.reset(target.x, target.y);
                    }
            }
        }
        });
        socket.on('heretheyareupdated', (playershere) => {

            if (this.iamsecondplayer === false) {
                playershere = playershere.filter(i => i != playershere[this.socketid]);
                this.secondPlayer.rotation = this.scene.physics.moveToObject(this.secondPlayer, playershere[0].target, playershere[0].speed) + 1.5707963267948966;
            }
        });
        socket.on('heretheyaredeleted', () => {socket.off();});
    }
    givePlayer(player) {
        this.called = true;
        this.secondPlayer = player;
        console.log("I got the player!");
    }
    givePlayerArray(playArray) {
        this.playerArray = playArray;
        console.log("I got the player array!");
    }
    kill() {
        this.isAlive = false;

        this.body.stop();
    }

    preUpdate() {
        if (this.body.speed > 0 && this.isAlive) {
            if (Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) < 6) {
                this.body.reset(this.target.x, this.target.y);
            }
        }
    }
    update() {

    }

}