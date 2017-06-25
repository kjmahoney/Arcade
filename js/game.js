
BasicGame.Game = function (game) {

};

BasicGame.Game.prototype = {

  preload: function () {
    //skipped preload state for dev so we load the file here
    this.load.image('sea', 'assets/sea.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.spritesheet('enemy-zero', 'assets/enemy.png', 32, 32);
    this.load.spritesheet('explosion', 'assets/explosion.png', 32, 32);
    this.load.spritesheet('player', 'assets/player.png', 64, 64);
  },

  create: function () {
    this.sea = this.add.tileSprite(0, 0, 800, 600, 'sea');

    this.player = this.add.sprite(400, 550, 'player');
    this.player.anchor.setTo(0.5, 0.5);
    this.player.animations.add('fly', [0,1,2], 20, true);
    this.player.play('fly');
    this.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.speed = 300;
    this.player.body.collideWorldBounds = true;

    this.enemy = this.add.sprite(400, 200, 'enemy-zero');
    this.enemy.animations.add('fly', [ 0, 1, 2 ], 20, true);
    this.enemy.play('fly');
    this.enemy.anchor.setTo(0.5,0.5);
    //TODO is there a function that i can just make one big physics object? cluttery inline
    this.physics.enable(this.enemy, Phaser.Physics.ARCADE);

    this.bullets = [];
    this.nextShotAt = 0;
    this.shotDelay = 100;

    this.cursors = this.input.keyboard.createCursorKeys();
  },

  update: function () {
    this.sea.tilePosition.y += .2;

    for (var i = 0; i < this.bullets.length; i++) {      this.physics.arcade.overlap(        this.bullets[i], this.enemy, this.enemyHit, null, this      );    }
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;

    if (this.cursors.left.isDown) {
      this.player.body.velocity.x = -this.player.speed;
    } else if (this.cursors.right.isDown) {
      this.player.body.velocity.x = this.player.speed;
    }

     if (this.cursors.up.isDown) {
      this.player.body.velocity.y = -this.player.speed;
    } else if (this.cursors.down.isDown) {
      this.player.body.velocity.y = this.player.speed;
    }

    if (this.input.activePointer.isDown &&
    this.physics.arcade.distanceToPointer(this.player) > 15) {
        this.physics.arcade.moveToPointer(this.player, this.player.speed);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.Z) ||
        this.input.activePointer.isDown) {
      this.fire();
    }
  },

  render: function() {
    //uncomment when testing
    // this.game.debug.body(this.bullet);
    // this.game.debug.body(this.enemy);
  },


  quitGame: function (pointer) {

    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

    //  Then let's go back to the main menu.
    this.state.start('MainMenu');
  },

  enemyHit: function (bullet, enemy) {
    console.log('kev');
    bullet.kill();
    enemy.kill();
    var explosion = this.add.sprite(enemy.x,enemy.y, 'explosion');
    explosion.anchor.setTo(0.5, 0.5);
    explosion.animations.add('boom');

      // 15 - set the frames per second
      // false - don’t loop the animation
      // true - kill the sprite at the end of the animation\
      //IDEA: can make a heartbeat by setting third param to true
    explosion.play('boom', 15, false, true);
  } ,

  fire: function () {
    if (this.nextShotAt > this.time.now) {
      return;
    }
    this.nextShotAt = this.time.now + this.shotDelay;

    var bullet = this.add.sprite(this.player.x, this.player.y - 20, 'bullet'); bullet.anchor.setTo(0.5, 0.5);
    this.physics.enable(bullet, Phaser.Physics.ARCADE); bullet.body.velocity.y = -500;
    this.bullets.push(bullet);
  }
};
