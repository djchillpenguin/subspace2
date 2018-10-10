let ship;
let healthbar;
let shipHit = false;

var Ship = new Phaser.Class ({

    Extends: Phaser.Physics.Arcade.Sprite,

    initialize:

    function Ship (scene)
    {
        Phaser.Physics.Arcade.Sprite.call(this, scene, 0, 0, 'ship');
    }
});

var Laser = new Phaser.Class ({

    Extends: Phaser.Physics.Arcade.Image,

    initialize:

    function Laser (scene)
    {
        Phaser.Physics.Arcade.Image.call(this, scene, 0, 0, 'laserShot');

        this.lifespan = 2000;
        this.cooldown = 300;
        this.speed = 500;
    },

    shoot: function (ship)
    {
        this.lifespan = 2000;
        this.setActive(true);
        this.setVisible(true);
        this.setDepth(2);
        this.body.enable = true;
        this.body.setMass(0.01);
        this.setRotation(ship.rotation);
        this.setPosition(ship.x, ship.y);

        this.scene.physics.velocityFromRotation(this.rotation, this.speed, this.body.velocity);
        this.setVelocityX(this.body.velocity.x + ship.body.velocity.x);
        this.setVelocityY(this.body.velocity.y + ship.body.velocity.y);
        console.log('shoot!');
    },

    update: function (time, delta)
    {
        this.lifespan -= delta;

        if (this.lifespan <= 0)
        {
            this.kill();
        }
    },

    kill: function ()
    {
        this.setActive(false);
        this.setVisible(false);
        this.body.stop();
        this.body.enable = false;
    }
});

var LoginScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function LoginScene ()
    {
        Phaser.Scene.call(this, { key: 'LoginScene' });
    },

    preload: function ()
    {

    },

    create: function ()
    {

    },

    update: function ()
    {

    }
});

var BattleScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function BattleScene ()
    {
        Phaser.Scene.call(this, { key: 'BattleScene' });
    },



    preload: function ()
    {
        this.load.image('blueShip', 'assets/blueShip.png');
        this.load.image('orangeShip', 'assets/orangeShip.png');
        this.load.image('tiles', 'assets/spaceTiles.png');
        this.load.tilemapTiledJSON('map', 'assets/arenaMap.json');
        this.load.image('laserShot', 'assets/laserShot.png');
        this.load.spritesheet('healthbar', 'assets/healthbar.png', { frameWidth: 80, frameHeight: 16 });
        this.load.audio('laser', 'assets/laser.wav');
        this.load.audio('engine', 'assets/engine.wav');
        this.load.audio('shipHit', 'assets/shipHit.wav');
        this.load.audio('explosion', 'assets/explosion.wav');
    },

    create: function ()
    {
        //create sounds
        laserSound = this.sound.add('laser');
        engine = this.sound.add('engine');
        shipHitSound = this.sound.add('shipHit');
        explosion = this.sound.add('explosion');

        //create player ship
        ship = this.physics.add.sprite(800, 800, 'blueShip');
        ship.setScale(2);
        ship.setMaxVelocity(500);
        ship.setDepth(10);
        ship.lastFired = 0;
        ship.hp = 5;
        ship.isAlive = true;
        ship.deathTime = 0;
        ship.respawnTime = 3000;

        //create map
        map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('spaceTiles', 'tiles');
        const spaceLayer = map.createStaticLayer('space', tileset, 0, 0).setScale(4);
        const structureLayer = map.createStaticLayer('structure', tileset, 0, 0).setScale(4);

        spaceLayer.scrollFactorX = 0.5;
        spaceLayer.scrollFactorY = 0.5;

        structureLayer.setCollisionByProperty({ collides: true });

        lasers = this.physics.add.group({
            classType: Laser,
            maxSize: 20,
            runChildUpdate: true
        });

        enemyLasers = this.physics.add.group({
            classType: Laser,
            maxSize: 50,
            runChildUpdate: true
        });

        healthbar = this.add.sprite(100, 50, 'healthbar').setScale(2);
        healthbar.scrollFactorX = 0;
        healthbar.scrollFactorY = 0;

        this.anims.create({
            key: 'zeroHealth',
            frames: [ { key: 'healthbar', frame: 0 }],
            frameRate: 60,
            repeat: 0
        });

        this.anims.create({
            key: 'oneHealth',
            frames: [ { key: 'healthbar', frame: 1 }],
            frameRate: 60,
            repeat: 0
        });

        this.anims.create({
            key: 'twoHealth',
            frames: [ { key: 'healthbar', frame: 2 }],
            frameRate: 60,
            repeat: 0
        });

        this.anims.create({
            key: 'threeHealth',
            frames: [ { key: 'healthbar', frame: 3 }],
            frameRate: 60,
            repeat: 0
        });

        this.anims.create({
            key: 'fourHealth',
            frames: [ { key: 'healthbar', frame: 4 }],
            frameRate: 60,
            repeat: 0
        });

        this.anims.create({
            key: 'fiveHealth',
            frames: [ { key: 'healthbar', frame: 5 }],
            frameRate: 60,
            repeat: 0
        });

        healthbar.anims.play('fiveHealth');

        var self = this;
        this.socket = io();
        this.otherPlayers = this.physics.add.group();

        this.socket.on('currentPlayers', function (players) {
            Object.keys(players).forEach(function (id) {
                if (players[id].playerId === self.socket.id) {

                }
                else {
                    addOtherPlayers(self, players[id]);
                }
            });
        });

        this.socket.on('newPlayer', function (playerInfo) {
            addOtherPlayers(self, playerInfo);
        });

        this.socket.on('disconnect', function (playerId) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerId === otherPlayer.playerId) {
                    otherPlayer.destroy();
                }
            });
        });

        this.socket.on('playerMoved', function (playerInfo) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    otherPlayer.setRotation(playerInfo.rotation);
                    otherPlayer.setVelocityX(playerInfo.vel.x);
                    otherPlayer.setVelocityY(playerInfo.vel.y);
                    otherPlayer.x = playerInfo.x;
                    otherPlayer.y = playerInfo.y;
                }
            });
        });

        this.socket.on('enemyFired', function (playerInfo) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    enemyLaser = enemyLasers.get();

                    if(enemyLaser)
                    {
                        enemyLaser.shoot(otherPlayer);
                        laserSound.play();
                        console.log('enemy shot!');
                    }
                }
            })
        });

        this.socket.on('shipDeath', function (playerInfo) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    otherPlayer.setVisible(false);
                    otherPlayer.setActive(false);
                    explosion.play();
                }
            });
        });

        this.socket.on('shipAlive', function (playerInfo) {
            console.log(playerInfo.playerId)
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    otherPlayer.setVisible(true);
                    otherPlayer.setActive(true);
                }
            });
        });

        /*this.socket.on('healthUpdate', function (playerInfo) {
            if (playerInfo.playerId === otherPlayer.playerId) {
                if (playerInfo.playerId === otherPlayer.playerId) {

                }
                console.log('health update');
            }
        });*/

        this.cursors = this.input.keyboard.createCursorKeys();

        camera = this.cameras.main;
        camera.startFollow(ship);
        this.physics.add.collider(ship, structureLayer);
        this.physics.add.collider(this.otherPlayers, structureLayer);
        this.physics.add.collider(ship, this.otherPlayers);
        this.physics.add.collider(lasers, this.otherPlayers, this.enemyHitCallback);
        this.physics.add.collider(ship, enemyLasers, this.shipHitCallback);
        ship.setBounce(.75);
    },

    update: function (time, delta)
    {
        if(shipHit)
        {
            this.socket.emit('shipHit');
            console.log('Im hit');
            if (ship.hp > 0){
                ship.hp -= 1;
                changeHealth(ship);
                shipHitSound.play();
            }

            shipHit = false;
        }

        if (ship.hp <= 0 && ship.isAlive)
        {
            this.socket.emit('shipDied');
            ship.isAlive = false;
            ship.setVisible(false);
            ship.setActive(false);
            explosion.play();
            ship.deathTime = time;
        }

        if (time > (ship.deathTime + ship.respawnTime) && ship.isAlive === false)
        {
            console.log('respawn');
            this.socket.emit('respawn');
            this.socket.emit('playerMovement', { x: ship.x, y: ship.y, vel: ship.body.velocity, rotation: ship.rotation });
            ship.isAlive = true;
            ship.hp = 5;
            changeHealth(ship);
            ship.setVisible(true);
            ship.setActive(true);
            ship.setPosition(800, 800);
            ship.setVelocityX(0);
            ship.setVelocityY(0);
            ship.setRotation(0);
        }

        if (this.cursors.left.isDown) {
            ship.setAngularVelocity(-300);
        }
        else if (this.cursors.right.isDown) {
            ship.setAngularVelocity(300);
        }
        else {
            ship.setAngularVelocity(0);
        }

        if (this.cursors.up.isDown) {
            this.physics.velocityFromRotation(ship.rotation, 200, ship.body.acceleration);
            engine.play();
        }
        else if (this.cursors.down.isDown) {
            this.physics.velocityFromRotation(ship.rotation, -200, ship.body.acceleration);
            engine.play();
        }
        else {
            ship.setAcceleration(0);
        }

        if (this.cursors.space.isDown && time > ship.lastFired) {
            var laser = lasers.get();

            if (laser)
            {
                this.socket.emit('shotFired');
                laser.shoot(ship);
                laserSound.play();
                ship.lastFired = time + laser.cooldown;
            }
        }

        var x = ship.x;
        var y = ship.y;
        var r = ship.rotation;

        if (ship.oldPosition && (x !== ship.oldPosition.x || y !== ship.oldPosition.y || r !== ship.oldPosition.rotation)) {
            this.socket.emit('playerMovement', { x: ship.x, y: ship.y, vel: ship.body.velocity, rotation: ship.rotation });
        }

        ship.oldPosition = {
            x: ship.x,
            y: ship.y,
            rotation: ship.rotation
        };
    },

    shipHitCallback: function (ship, laser)
    {
        shipHit = true;
        laser.kill();

        if (ship.hp > 0)
        {

        }
    },

    enemyHitCallback: function (laser, otherPlayer)
    {
        laser.kill();
    }

});

//game config
var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
            fps: 60
        }
    },
    scene: [
        BattleScene
    ]
};

//starts game
var game = new Phaser.Game(config);

/*function addPlayer (self, playerInfo)
{
    self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setScale(2);

    if (playerInfo.team === 'blue') {
        self.ship.setTint(0x0000ff);
    }
    else {
        self.ship.setTint(0xff0000);
    }

    self.ship.setMaxVelocity(500);
}*/

function addOtherPlayers (self, playerInfo)
{
    const otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'orangeShip').setScale(2);
    otherPlayer.setDepth(10);

    otherPlayer.playerId = playerInfo.playerId;

    self.otherPlayers.add(otherPlayer);
}

function changeHealth (ship)
{
    if (ship.hp === 0)
    {
        healthbar.anims.play('zeroHealth');
    }
    else if (ship.hp === 1)
    {
        healthbar.anims.play('oneHealth');
    }
    else if (ship.hp === 2)
    {
        healthbar.anims.play('twoHealth');
    }
    else if (ship.hp === 3)
    {
        healthbar.anims.play('threeHealth');
    }
    else if (ship.hp === 4)
    {
        healthbar.anims.play('fourHealth');
    }
    else if (ship.hp === 5)
    {
        healthbar.anims.play('fiveHealth');
    }
}
