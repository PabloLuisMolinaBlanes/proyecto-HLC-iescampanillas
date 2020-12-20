class MainGame extends Phaser.Scene {
    constructor() {
        super('MainGame');

        this.player;
        this.players;
        this.germs;
        this.pickups;
        this.started;
        this.introText;
        this.scoreText;
        this.score = 0;
        this.highscore = 0;
        this.firstPlayer;
        this.newHighscore = false;
    }

    create() {
        this.score = 0;
        this.highscore = this.registry.get('highscore');
        this.newHighscore = false;

        this.add.image(400, 300, 'background').setScale(2);

        this.germs = new Germs(this.physics.world, this);
        this.hitbyplayer = false;
        this.pickups = new Pickups(this.physics.world, this);
        this.playersecond;
        this.player = new Player(this, Math.floor(400 * Math.random()), Math.floor(400 * Math.random()), false);
        this.players = [];
        this.socketid = null;
        let self = this;
        socket.emit('getmeallplayers');
        socket.on('hereisyoursocketid', (id) => {
            if (self.socketid !== null) {
            } else {
                self.socketid = id;
                self.player.socketid = id;
            }
        });
        socket.emit('amithefirstplayer');
        socket.on('youarethefirstplayer', () => {
            this.firstPlayer = true;
        })
        socket.on('heretheyare', (playershere, type) => {
            console.log("Someone from the server called I");
            console.log(self.socketid);
            playershere = playershere.filter(i => i != playershere[self.socketid]);
            console.log(playershere);
            if (playershere[0] != null) {
                this.playersecond = new Player(this, playershere[0].x, playershere[0].y, true);
                self.players.push(this.playersecond);
                this.player.givePlayer(this.playersecond);
                this.player.givePlayerArray(this.players);
                if (this.firstPlayer) {
                this.physics.add.overlap(this.player, this.playersecond, (player, germ) => this.playerHitPlayer(player, germ));
                }
                this.physics.add.overlap(this.player, this.germs, (player, germ) => this.playerHitGerm(player, germ));
                this.physics.add.overlap(this.player, this.pickups, (player, pickup) => this.playerHitPickup(player, pickup));
            }
            console.log(self.players);
        });
        /*
        socket.on('heretheyareupdated', (playershere, type) => {
            var counter = 0;
            playershere = playershere.filter(i => i != playershere[self.socketid]);
            self.players[0].target = playershere[0].target;
            self.players[0].speed = playershere[0].speed;
            self.players[0].rotation = playershere[0].rotation;
        });
        */
        socket.on('heretheyaredeleted', (playershere, type) => {
            var counter = 0;
            self.players.pop();
            socket.off();
        });
        this.scoreText = this.add.bitmapText(16, 32, 'slime', 'Score   0', 40).setDepth(1);

        this.introText = this.add.bitmapText(400, 300, 'slime', 'Avoid the Germs\nCollect the Rings', 60).setOrigin(0.5).setCenterAlign().setDepth(1);

        this.pickups.start();
        socket.on('istarted', () => {
            console.log("They started");
            this.playersecond.start();
        });
        this.input.once('pointerdown', () => {
            socket.on('gameoverforyou', () => {this.gameOver();});
            this.player.start();
            this.started = true;
            socket.emit('ibegan');

            var counter = 0;
            if (this.firstPlayer) {
            //this.germs.start();
            }

            this.sound.play('start');

            this.tweens.add({
                targets: this.introText,
                alpha: 0,
                duration: 300
            });

        });

        this.physics.add.overlap(this.player, this.pickups, (player, pickup) => this.playerHitPickup(player, pickup));
        this.physics.add.overlap(this.player, this.germs, (player, germ) => this.playerHitGerm(player, germ));
        if (this.firstPlayer) {
            this.physics.add.overlap(this.player, this.player.secondPlayer, (player, playersec) => this.playerHitPlayer(player, playersec));
        }
    }

    playerHitGerm(player, germ) {
        //  We don't count a hit if the germ is fading in or out
        if (player.isAlive && germ.alpha === 1) {
            this.gameOver();
        }
    }
    playerHitPlayer(player, playersec) {
        if (player.isAlive) {
            this.hitbyplayer = true;
            this.gameOver();
        }
    }

    playerHitPickup(player, pickup) {
        this.score++;

        this.scoreText.setText('Score   ' + this.score);

        if (!this.newHighscore && this.score > this.highscore) {
            if (this.highscore > 0) {
                //  Only play the victory sound if they actually set a new highscore
                this.sound.play('victory');
            }
            else {
                this.sound.play('pickup');
            }

            this.newHighscore = true;
        }
        else {
            this.sound.play('pickup');
        }

        this.pickups.collect(pickup);
    }

    gameOver() {
        this.player.kill();
        if (this.hitbyplayer) {
        } else {
            if (this.firstPlayer) {
            this.germs.stop();
            }
        }
        var counterOver = true;
        if (this.player.iamsecondplayer) {
        } else {
        if (counterOver) {
        socket.emit('gameoverforme');
        socket.emit('deletemyplayer');
        }
        counterOver = false;
        }

        this.sound.stopAll();
        this.sound.play('fail');

        this.introText.setText('Game Over!');

        this.tweens.add({
            targets: this.introText,
            alpha: 1,
            duration: 300
        });

        if (this.newHighscore) {
            this.registry.set('highscore', this.score);
        }

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }

    getPlayer(target) {
        target.x = this.player.x;
        target.y = this.player.y;
        self.players = [];
        return target;
    }
}