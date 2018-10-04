var BattleScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function BattleScene ()
    {
        Phaser.Scene.call(this, { key: 'BattleScene' });
        let ship;
    },

    preload: function ()
    {
        this.load.image('ship', 'assets/ship.png');
        this.load.image('tiles', 'assets/spaceTiles.png');
        this.load.tilemapTiledJSON('map', 'assets/arenaMap.json');
    },

    create: function ()
    {
        //create map
        map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('spaceTiles', 'tiles');
        const spaceLayer = map.createStaticLayer('space', tileset, 0, 0).setScale(4);
        const structureLayer = map.createStaticLayer('structure', tileset, 0, 0).setScale(4);
        structureLayer.setDepth(10);

        structureLayer.setCollisionByProperty({ collides: true });

        ship = this.physics.add.sprite(800, 800, 'ship').setScale(2);
        ship.setMaxVelocity(500);

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
                    otherPlayer.body.setVelocityX(playerInfo.velX);
                    otherPlayer.body.setVelocityY(playerInfo.velY);
                }
            });
        });

        this.cursors = this.input.keyboard.createCursorKeys();

        camera = this.cameras.main;
        camera.startFollow(ship);
        this.physics.add.collider(ship, structureLayer);
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

        var velX = ship.velocityX;
        var velY = ship.velocityY;
        var r = ship.rotation;

        if (ship.oldPosition && (velX !== ship.velocityX || velY !== ship.velocityY || r !== ship.oldPosition.rotation)) {
            this.socket.emit('playerMovement', { velX: ship.velocityX, velY: ship.velocityY, rotation: ship.rotation });
        }

        ship.oldPosition = {
            velX: ship.velocityX,
            velY: ship.velocityY,
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

function addPlayer (self, playerInfo)
{
    self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setScale(2);

    if (playerInfo.team === 'blue') {
        self.ship.setTint(0x0000ff);
    }
    else {
        self.ship.setTint(0xff0000);
    }

    self.ship.setMaxVelocity(500);
}

function addOtherPlayers (self, playerInfo)
{
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'ship').setScale(2);

    if (playerInfo.team === 'blue') {
        otherPlayer.setTint(0x0000ff);
    }
    else {
        otherPlayer.setTint(0xff0000);
    }
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}
