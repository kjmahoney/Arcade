
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
    this.setupBackground();
    this.setupPlayer();
    this.setupEnemy();
    this.setupBullets();
    this.setupExplosions();
    this.setupText();

    this.cursors = this.input.keyboard.createCursorKeys();
  },

  update: function () {
    this.sea.tilePosition.y += .2;
    this.checkCollisions();
    this.spawnEnemies();
    this.processPlayerInput();
    this.processDelayedEffects();
  },

  render: function() {
    //uncomment when testing
    // this.game.debug.body(this.player);
  },

  setupBackground() {
    this.sea = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'sea');
    this.sea.autoScroll(0, BasicGame.SEA_SCROLL_SPEED);
  },

  setupPlayer() {
    this.player = this.add.sprite(this.game.width / 2, this.game.height - 50, 'player');
    this.player.anchor.setTo(0.5, 0.5);
    this.player.animations.add('fly', [0,1,2], 20, true);
    this.player.play('fly');
    this.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.speed = BasicGame.PLAYER_SPEED;
    this.player.body.collideWorldBounds = true;
    // 20 x 20 pixel hitbox, centered a little bit higher than the center
    this.player.body.setSize(20, 20, 23, 25);
  },

  setupEnemy() {
    this.enemyPool = this.add.group(); this.enemyPool.enableBody = true;
    this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemyPool.createMultiple(50, 'enemy-zero');
    this.enemyPool.setAll('anchor.x', 0.5);
    this.enemyPool.setAll('anchor.y', 0.5);
    this.enemyPool.setAll('outOfBoundsKill', true);
    this.enemyPool.setAll('checkWorldBounds', true);
    this.enemyPool.setAll('reward', BasicGame.ENEMY_REWARD, false, false, 0, true);

    // Set the animation for each sprite
    this.enemyPool.forEach(function (enemy) {
      enemy.animations.add('fly', [0, 1, 2], 20, true);
      enemy.animations.add('hit', [3, 1, 3, 2], 20, false);
      enemy.events.onAnimationComplete.add( function(e) {
        e.play('fly');
      }, this);
    });

    this.nextEnemyAt = 0;
    this.enemyDelay = BasicGame.SPAWN_ENEMY_DELAY;
  },

  setupBullets() {
    this.bulletPool = this.add.group();
    // Enable physics to the whole sprite group
    this.bulletPool.enableBody = true;
    this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.bulletPool.createMultiple(100, 'bullet');

    this.bulletPool.setAll('anchor.x', 0.5);
    this.bulletPool.setAll('anchor.y', 0.5);

    this.bulletPool.setAll('outOfBoundsKill', true);
    this.bulletPool.setAll('checkWorldBounds', true);

    this.nextShotAt = 0;
    this.shotDelay = BasicGame.SHOT_DELAY;
  },

  setupExplosions() {
    this.explosionPool = this.add.group();
    this.explosionPool.enableBody = true;
    this.explosionPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.explosionPool.createMultiple(100, 'explosion');
    this.explosionPool.setAll('anchor.x', 0.5);
    this.explosionPool.setAll('anchor.y', 0.5);

    this.explosionPool.forEach(function (explosion) {
      explosion.animations.add('boom');
    });
  },

  setupText() {
    this.instructions = this.add.text( this.game.width / 2, this.game.height -100,
      'Use Arrow Keys to Move, Press Z to Fire\n' + 'Tapping/clicking does both',
      { font: '20px monospace',
        fill: '#fff',
        align: 'center',
        boundsAlignH: "top",
        boundsAlignV:"top"
      }
    );
    this.instructions.anchor.setTo(0.5, 0.5);
    this.instExpire = this.time.now + BasicGame.INSTRUCTION_EXPIRE;

    this.score = 0;
    this.scoreText = this.add.text(
      this.game.width / 2, 30, ' ' + this.score,
      { font: '20px monospace',
        fill: '#fff',
        align: 'center',
        boundsAlignH: "top",
        boundsAlignV:"top"
      }
    );
    this.scoreText.anchor.setTo(0.5, 0.5);
  },

//Update functions

  checkCollisions() {
    this.physics.arcade.overlap(
      this.bulletPool, this.enemyPool, this.enemyHit, null, this
    );

    this.physics.arcade.overlap(
      this.player, this.enemyPool, this.playerHit, null, this
    );
  },

  spawnEnemies() {
    if (this.nextEnemyAt < this.time.now && this.enemyPool.countDead() > 0) {
      this.nextEnemyAt = this.time.now + this.enemyDelay;
      var enemy = this.enemyPool.getFirstExists(false);
      // spawn at a random location top of the screen
      enemy.reset(
        this.rnd.integerInRange(20, this.game.width - 20), 0, BasicGame.ENEMY_HEALTH);

      // also randomize the speed
      enemy.body.velocity.y = this.rnd.integerInRange(BasicGame.ENEMY_MIN_Y_VELOCITY, BasicGame.ENEMY_MAX_Y_VELOCITY);
      enemy.play('fly');
    }
  },

  processPlayerInput() {
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

  processDelayedEffects() {
    if (this.instructions.exists && this.time.now > this.instExpire) {
      this.instructions.destroy();
    }
  },

  quitGame: function (pointer) {

    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

    //  Then let's go back to the main menu.
    this.state.start('MainMenu');
  },

  enemyHit: function (bullet, enemy) {
    bullet.kill();
    this.damageEnemy(enemy, BasicGame.BULLET_DAMAGE);
  },

  playerHit: function(player, enemy) {
    // crashing into an enemy only deals 5 damage
    this.damageEnemy(enemy, BasicGame.CRASH_DAMAGE);
    this.explode(player);
    player.kill();
  },

  fire: function () {
    if (!this.player.alive || this.nextShotAt > this.time.now) {
      return;
    }

    if (this.bulletPool.countDead() === 0) {
      return;
    }

    this.nextShotAt = this.time.now + this.shotDelay;
    //using revive instead of making a new bullet everytime we shoot
    // Find the first dead bullet in the pool
    var bullet = this.bulletPool.getFirstExists(false);
    // Reset (revive) the sprite and place it in a new location
    bullet.reset(this.player.x, this.player.y - 20);
    bullet.body.velocity.y = -BasicGame.BULLET_VELOCITY;
  },

  explode: function (sprite) {
    if (this.explosionPool.countDead() === 0) {
      return;
    }
    var explosion = this.explosionPool.getFirstExists(false);
    explosion.reset(sprite.x, sprite.y);
    // 15 - set the frames per second// false - don’t loop the animation// true - kill the sprite at the end of the animation\
    //IDEA: can make a heartbeat by setting third param to true
    explosion.play('boom', 15, false, true);
    // add the original sprite's velocity to the explosion
    explosion.body.velocity.x = sprite.body.velocity.x;
    explosion.body.velocity.y = sprite.body.velocity.y;
  },

  damageEnemy(enemy, damage) {
    enemy.damage(damage);

    if (enemy.alive) {
      enemy.play('hit');
    } else {
      this.explode(enemy);
      this.addToScore(enemy.reward);
    }
  },

  addToScore(score) {
    this.score += score;
    this.scoreText.text = this.score;
  }
};
