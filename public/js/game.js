let ship;

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
        this.setDepth(2)
        this.body.enable = true;
        this.setRotation(ship.rotation);
        this.setPosition(ship.x, ship.y);
        this.setVelocityX(ship.body.velocity.x);
        this.setVelocityY(ship.body.velocity.y);

        this.scene.physics.velocityFromRotation(this.rotation, this.speed, this.body.velocity);
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
    },

    create: function ()
    {
        //create player ship
        ship = this.physics.add.sprite(800, 800, 'blueShip');
        ship.setScale(2);
        ship.setMaxVelocity(500);
        ship.setDepth(10);
        ship.lastFired = 0;

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
                        console.log('enemy shot!');
                    }
                }
            })
        });

        this.cursors = this.input.keyboard.createCursorKeys();

        camera = this.cameras.main;
        camera.startFollow(ship);
        this.physics.add.collider(ship, structureLayer);
        this.physics.add.collider(this.otherPlayers, structureLayer);
        this.physics.add.collider(ship, this.otherPlayers);
        ship.setBounce(.75);
    },

    update: function (time, delta)
    {

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
            this.physics.velocityFromRotation(ship.rotation, 200, ship.body.acceleration)
        }
        else if (this.cursors.down.isDown) {
            this.physics.velocityFromRotation(ship.rotation, -200, ship.body.acceleration)
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
