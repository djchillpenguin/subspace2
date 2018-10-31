let ship;
let healthbar;
let shipHit = false;
let pilotName = {};
let shipModel = "";

//custom classes
var Ship = new Phaser.Class ({

    Extends: Phaser.Physics.Arcade.Sprite,

    initialize:

    function Ship (scene)
    {
        Phaser.Physics.Arcade.Sprite.call(this, scene, 0, 0, 'ship');
    }
});


var EngineFire = new Phaser.Class ({

    Extends: Phaser.Physics.Arcade.Sprite,

    initialize:

    function EngineFire (scene)
    {
        Phaser.Physics.Arcade.Sprite.call(this, scene, 0, 0, 'engineFire');

        this.lifespan = 1200;
    },

    fire: function (ship)
    {
        this.setScale(1);
        this.setDepth(15);
        this.setPosition(ship.x, ship.y);
        this.setRotation(ship.rotation);
        this.setMaxVelocity(225);
        this.setVelocityX(ship.body.velocity.x);
        this.setVelocityY(ship.body.velocity.y);
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
        /*this.setActive(false);
        this.setVisible(false);
        this.body.stop();
        this.body.enable = false;*/
        this.destroy();
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
        this.setPosition(ship.x, ship.y);
        this.setRotation(ship.rotation);

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

//login scene
var LoginScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function LoginScene ()
    {
        Phaser.Scene.call(this, { key: 'LoginScene' });
    },

    preload: function ()
    {
        this.load.image('blueShip', 'assets/ships/blueShip.png');
        this.load.image('orangeShip', 'assets/ships/orangeShip.png');
        this.load.image('greenShip', 'assets/ships/greenShip.png');
        this.load.image('purpleShip', 'assets/ships/purpleShip.png');
        this.load.image('redShip', 'assets/ships/redShip.png');
        this.load.image('yellowShip', 'assets/ships/yellowShip.png');
        this.load.image('tiles', 'assets/spaceTiles-extruded.png');
        this.load.tilemapTiledJSON('map', 'assets/arenaMap.json');
        this.load.image('laserShot', 'assets/laserShot.png');
        this.load.spritesheet('healthbar', 'assets/healthbar.png', { frameWidth: 80, frameHeight: 16 });
        this.load.spritesheet('explosion', 'assets/explosion.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('engineFire', 'assets/engineFireNew.png', { frameWidth: 24, frameHeight: 24 });
        this.load.audio('laser', 'assets/laser.wav');
        this.load.audio('engine', 'assets/engine.wav');
        this.load.audio('shipHit', 'assets/shipHit.wav');
        this.load.audio('explosion', 'assets/explosion.wav');
        this.load.audio('wallBounceSound', 'assets/wallBounce.wav');
        this.load.image('loginButton', 'assets/loginButton.png');
        this.load.image('leftButton', 'assets/leftButton.png');
        this.load.image('rightButton', 'assets/rightButton.png');
        this.load.image('realSpace', 'assets/realSpace.png');
        this.load.spritesheet('shield', 'assets/shield.png', { frameWidth: 26, frameHeight: 26 });
    },

    create: function ()
    {
        //this.socket = io();
        var shipChoices = [
            'yellowShip',
            'orangeShip',
            'redShip',
            'purpleShip',
            'blueShip',
            'greenShip'
        ];

        //title = this.add.text(320, 50, 'SUBSPACE 2',
                //{ font: '48px Righteous', fill: '#ffffff' });
        loginButtonText = this.add.text((this.game.renderer.width / 2) - 36, 234, 'LOGIN',
                          { font: '24px Righteous', fill: '#ffffff'});
        loginButtonText.setDepth(2);
        loginButton = this.add.sprite(this.game.renderer.width / 2, 250, 'loginButton').setInteractive().setScale(4);
        leftButton = this.add.sprite((this.game.renderer.width / 2) - 100, 100, 'leftButton').setInteractive().setScale(4);
        rightButton = this.add.sprite((this.game.renderer.width / 2) + 100, 100, 'rightButton').setInteractive().setScale(4);
        shipChoice = this.add.sprite(this.game.renderer.width / 2, 100, shipChoices[0]).setScale(4);

        loginButton.on('pointerdown', function (pointer) {
            pilotname = document.getElementById("pilotname").value;
            shipModel = shipChoices[0];
            //this.socket.emit('login', pilotname);
            document.getElementById("title").disabled = true;
            document.getElementById("title").style.display = "none";
            document.getElementById("pilotname").disabled = true;
            document.getElementById("pilotname").style.display = "none";
            document.getElementById("pilotNameLabel").disabled = true;
            document.getElementById("pilotNameLabel").style.display = "none";
            this.scene.start('BattleScene');
        }, this);

        leftButton.on('pointerdown', function (pointer) {
            temp = shipChoices.shift();
            shipChoice.setTexture(shipChoices[0]);
            shipChoices.push(temp);
        }, this);

        rightButton.on('pointerdown', function (pointer) {
            temp = shipChoices.pop();
            shipChoice.setTexture(temp);
            shipChoices.unshift(temp);
        }, this);
    },

    update: function ()
    {

    }
});

//battle scene
var BattleScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function BattleScene ()
    {
        Phaser.Scene.call(this, { key: 'BattleScene' });
    },



    preload: function ()
    {
        /*this.load.image('blueShip', 'assets/blueShip.png');
        this.load.image('orangeShip', 'assets/orangeShip.png');
        this.load.image('tiles', 'assets/spaceTiles-extruded.png');
        this.load.tilemapTiledJSON('map', 'assets/arenaMap.json');
        this.load.image('laserShot', 'assets/laserShot.png');
        this.load.spritesheet('healthbar', 'assets/healthbar.png', { frameWidth: 80, frameHeight: 16 });
        this.load.spritesheet('explosion', 'assets/explosion.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('engineFire', 'assets/engineFire.png', { frameWidth: 22, frameHeight: 22 });
        this.load.audio('laser', 'assets/laser.wav');
        this.load.audio('engine', 'assets/engine.wav');
        this.load.audio('shipHit', 'assets/shipHit.wav');
        this.load.audio('explosion', 'assets/explosion.wav');
        this.load.audio('wallBounceSound', 'assets/wallBounce.wav');*/
    },

    create: function ()
    {
        //create sounds
        laserSound = this.sound.add('laser');
        engine = this.sound.add('engine');
        shipHitSound = this.sound.add('shipHit');
        explosionSound = this.sound.add('explosion');
        wallBounceSound = this.sound.add('wallBounceSound');

        //create player ship
        ship = this.physics.add.sprite(800, 800, shipModel);
        ship.setCircle(10);
        ship.setScale(1);
        ship.setMaxVelocity(250);
        ship.setDepth(10);
        ship.lastFired = 0;
        ship.hp = 200;
        ship.isAlive = true;
        ship.deathTime = 0;
        ship.respawnTime = 5000;
        ship.pilotname = pilotname;
        ship.shipModel = shipModel;
        console.log(ship.pilotname);
        ship.shield = this.physics.add.sprite(ship.x, ship.y, 'shield').setDepth(15);
        ship.shield.setAlpha(0);

        //create map
        map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('spaceTiles', 'tiles', 16, 16, 1, 2);
        const spaceLayer = map.createStaticLayer('space', tileset, 0, 0).setScale(2);
        //spaceLayer = this.add.image(0, 0, 'realSpace').setOrigin(0, 0).setScale(0.5);
        const structureLayer = map.createStaticLayer('structure', tileset, 0, 0).setScale(2);

        spaceLayer.scrollFactorX = 0.2;
        spaceLayer.scrollFactorY = 0.2;

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

        engineFires = this.physics.add.group({
            classType: EngineFire,
            maxSize: 200,
            runChildUpdate: true
        });


        //healthbar = this.add.sprite(100, 50, 'healthbar').setScale(1);
        //healthbar.scrollFactorX = 0;
        //healthbar.scrollFactorY = 0;

        //healthbar animations

        energybar = this.add.rectangle(50, 50, 200, 24, 0x61d3e3).setOrigin(0, 0);
        energybar.setDepth(15);
        energybar.scrollFactorX = 0;
        energybar.scrollFactorY = 0;
        energybar.maxWidth = 200;

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

        //healthbar.anims.play('fiveHealth');

        //ship animations

        this.anims.create({
            key: 'shipReset',
            frames: [{ key: 'ship', frame: 0 }],
            frameRate: 60,
            repeat: 0
        });

        this.anims.create({
            key: 'shipExplosion',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 7 }),
            frameRate: 8,
            repeat: 0
        });

        this.anims.create({
            key: 'shipEngineFire',
            frames: this.anims.generateFrameNumbers('engineFire', { start: 0, end: 7 }),
            frameRate: 16,
            repeat: 0
        });

        this.anims.create({
            key: 'shieldHit',
            frames: this.anims.generateFrameNumbers('shield', { start: 0, end: 3}),
            frameRate: 16,
            repeat: 0
        });

        //network stuff

        var self = this;
        this.socket = io();
        this.socket.emit('login', ship.pilotname, ship.shipModel);
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
            console.log('new player name: ', playerInfo.pilotname);
        });

        this.socket.on('disconnect', function (playerId) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerId === otherPlayer.playerId) {
                    otherPlayer.destroy();
                }
            });
        });

        this.socket.on('updateName', function (playerInfo) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    otherPlayer.pilotname = playerInfo.pilotname;
                    otherPlayer.setTexture(playerInfo.shipModel);
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
                    otherPlayer.anims.play('shipExplosion');
                    otherPlayer.body.enable = false;
                    explosionSound.play();

                    timedEvent = self.time.addEvent({
                        delay: 1000,
                        callback: onEvent,
                        callbackScope: self
                    });

                    function onEvent() {
                        otherPlayer.setVisible(false);
                        otherPlayer.setActive(false);
                    }
                }
            });
        });

        this.socket.on('shipAlive', function (playerInfo) {
            console.log(playerInfo.playerId)
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    otherPlayer.setVisible(true);
                    otherPlayer.setActive(true);
                    otherPlayer.body.enable = true;
                    //otherPlayer.anims.play('shipReset');
                    otherPlayer.setTexture(playerInfo.shipModel);
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
        this.physics.add.collider(ship, structureLayer, this.structureLayerVsShip);
        this.physics.add.collider(this.otherPlayers, structureLayer, this.structureLayerVsShip);
        this.physics.add.collider(ship, this.otherPlayers);
        this.physics.add.collider(lasers, this.otherPlayers, this.enemyHitCallback);
        this.physics.add.collider(ship, enemyLasers, this.shipHitCallback);
        this.physics.add.collider(engineFires, structureLayer, this.structureLayerVsEngineFires);
        ship.setBounce(.75);
    },

    update: function (time, delta)
    {
        if(shipHit)
        {
            this.socket.emit('shipHit');
            console.log('Im hit');
            if (ship.hp > 0){
                newWidth = energybar.width - (energybar.maxWidth * .2);

                if (newWidth > 0) {
                    energybar.setSize(newWidth, energybar.height);
                }
                else {
                    energybar.setSize(0, energybar.height);
                }
                ship.hp -= energybar.maxWidth * .2;
                //changeHealth(ship);
                shipHitSound.play();
            }

            shipHit = false;
        }

        if (ship.hp <= 0 && ship.isAlive)
        {
            ship.isAlive = false;
            ship.anims.play('shipExplosion');
            explosionSound.play();
            ship.body.enable = false;
            this.socket.emit('shipDied');
            ship.deathTime = time;

            timedEvent = this.time.addEvent({
                delay: 1000,
                callback: onEvent,
                callbackScope: this
            });

            function onEvent() {
                ship.setVisible(false);
                ship.setActive(false);
            }
        }

        if (time > (ship.deathTime + ship.respawnTime) && ship.isAlive === false)
        {
            console.log('respawn');
            this.socket.emit('respawn');
            this.socket.emit('playerMovement', { x: ship.x, y: ship.y, vel: ship.body.velocity, rotation: ship.rotation });
            ship.isAlive = true;
            ship.hp = 200;
            //changeHealth(ship);
            energybar.setSize(energybar.maxWidth, energybar.height);
            ship.setVisible(true);
            ship.setActive(true);
            ship.body.enable = true;
            ship.setPosition(800, 800);
            ship.setVelocityX(0);
            ship.setVelocityY(0);
            ship.setRotation(0);
            //ship.anims.play('shipReset');
            ship.setTexture(ship.shipModel);
        }

        //shield recharge
        if(energybar.width < energybar.maxWidth && ship.isAlive)
        {
            energybar.setSize(energybar.width + (energybar.maxWidth * .0001 * delta), energybar.height);
            ship.hp = energybar.width;
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
            engineFire = engineFires.get();

            if(engineFire)
            {
                engineFire.fire(ship);
                engineFire.anims.play('shipEngineFire');
            }
        }
        else if (this.cursors.down.isDown) {
            this.physics.velocityFromRotation(ship.rotation, -200, ship.body.acceleration);
            engine.play();
            engineFire = engineFires.get();

            if(engineFire)
            {
                engineFire.fire(ship);
                engineFire.anims.play('shipEngineFire');
                engineFire.setDepth(0);
            }
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

        this.otherPlayers.getChildren().forEach(function (otherPlayer) {
            otherPlayer.nameText.x = otherPlayer.x + 10;
            otherPlayer.nameText.y = otherPlayer.y + 10;
            otherPlayer.shield.setPosition(otherPlayer.x, otherPlayer.y);
        });

        ship.shield.setPosition(ship.x, ship.y);
    },

    shipHitCallback: function (ship, laser)
    {
        shipHit = true;
        ship.shield.setRotation(calcShieldRotation(ship, laser));
        console.log('shield rotation: ', ship.shield.body.rotation);
        laser.kill();
        //ship.shield.setPosition(ship.x, ship.y);
        //ship.shield.setVelocityX(ship.body.velocity.x);
        //ship.shield.setVelocityY(ship.body.velocity.y);
        ship.shield.setAlpha(1);
        ship.shield.anims.play('shieldHit');

        if (ship.hp > 0)
        {

        }
    },

    enemyHitCallback: function (laser, otherPlayer)
    {
        otherPlayer.shield.setRotation(calcShieldRotation(otherPlayer, laser));
        laser.kill();
        shipHitSound.play();

        //otherPlayer.shield.setPosition(otherPlayer.x, otherPlayer.y);
        //otherPlayer.shield.setVelocityX(otherPlayer.body.velocity.x);
        //otherPlayer.shield.setVelocityY(otherPlayer.body.velocity.y);
        otherPlayer.shield.setAlpha(1);
        otherPlayer.shield.anims.play('shieldHit');
    },

    structureLayerVsShip: function ()
    {
        wallBounceSound.play();
    },

    structureLayerVsEngineFires: function (engineFire, structureLayer)
    {
        if(engineFire)
        {
            engineFire.kill();
        }
    }

});

//game config
var config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    parent: 'game',
    pixelArt: false,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
            fps: 60
        }
    },
    scene: [
        LoginScene,
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
    const otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, playerInfo.shipModel).setScale(1);
    otherPlayer.setDepth(10);
    otherPlayer.setCircle(10);
    otherPlayer.shield = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'shield');
    otherPlayer.shield.setAlpha(0);

    otherPlayer.playerId = playerInfo.playerId;

    otherPlayer.nameText = self.add.text(playerInfo.x + 8, playerInfo.y + 8, playerInfo.pilotname,
                { font: '10px VT323', fill: '#00f900' });

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

function calcShieldRotation(spaceship, laser)
{
    //upper left
    if (spaceship.x - laser.x > 0 && spaceship.y - laser.y > 0)
    {
        angle = Math.atan(Math.abs(spaceship.y - laser.y) / Math.abs(spaceship.x - laser.x));
        return angle + Math.PI;
    }
    //upper right
    else if (spaceship.x - laser.x < 0 && spaceship.y - laser.y > 0)
    {
        angle = Math.atan(Math.abs(spaceship.y - laser.y) / Math.abs(spaceship.x - laser.x));
        return angle + (Math.PI * (3/2));
    }
    //lower left
    else if (spaceship.x - laser.x > 0 && spaceship.y - laser.y < 0)
    {
        angle = Math.atan(Math.abs(spaceship.y - laser.y) / Math.abs(spaceship.x - laser.x));
        return angle + (Math.PI / 2);
    }
    //lower right
    else if (spaceship.x - laser.x < 0 && spaceship.y - laser.y < 0)
    {
        angle = Math.atan(Math.abs(spaceship.y - laser.y) / Math.abs(spaceship.x - laser.x));
        return angle;
    }
    //directly above
    else if (spaceship.x - laser.x === 0 && spaceship.y - laser.y < 0)
    {
        return Math.PI * (3/2);
    }
    //directly below
    else if (spaceship.x - laser.x === 0 && spaceship.y - laser.y > 0)
    {
        return Math.PI / 2;
    }
    //directly left
    else if (spaceship.x - laser.x > 0 && spaceship.y - laser.y === 0)
    {
        return Math.PI;
    }
    //directly right
    else if (spaceship.x - laser.x < 0 && spaceship.y - laser.y === 0)
    {
        return 0;
    }
}
