var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {preload: preload, create: create, update: update});

var platforms,
    player,
    baddies,
    diamonds,
    score = 0,
    level = 1,
    numStars = 12,
    playerLives = 3,
    livesText,
    scoreText,
    explosion,
    baddieVelocity = 50,
    baddieGravity = 5000;

function preload() {

    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.image('diamond', 'assets/diamond.png')
    game.load.audio('collectStar', 'assets/collect_star.mp3');
    game.load.audio('explode', 'assets/explode.mp3');
    game.load.audio('ugh', 'assets/ugh.mp3');
    game.load.audio('bell', 'assets/bell.mp3');
    game.load.audio('bugle', 'assets/bugle.mp3');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.spritesheet('baddie', 'assets/baddie.png', 32, 32);
    game.load.atlas('explosion', 'assets/explosion.png', 'assets/explosion.json')

}

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    // set up game's background
    game.add.sprite(0, 0, 'sky');

    platforms = game.add.group();
    platforms.enableBody = true;

    var ground = platforms.create(0, game.world.height - 64, 'ground');
    ground.scale.setTo(2, 2);

    // Make sure the ground does not fall away when you jump on it.
    // If we don't do this. the ground will move when the player collides with it.
    ground.body.immovable = true;

    // Create two ledges
    var ledge = platforms.create(400, 400, 'ground');

    ledge.body.immovable = true;
    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;

    // The player and its settings
    player = game.add.sprite(32, game.world.height -150, 'dude');

    // Enable physics on the player
    game.physics.arcade.enable(player);
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    // Define two animations for our dude walking left and right
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    baddies = game.add.group();
    baddies.enableBody = true;

    // Create baddie
    launchBaddie();

    // Drop a sprinkling of stars into the scene and allow the player to collect them.
    stars = game.add.group();
    stars.enableBody = true;
    createStars();

    // Add diamonds group
    diamonds = game.add.group();
    diamonds.enableBody = true;

    // Add audio
    collectStarSound = game.add.audio('collectStar');
    deadSound = game.add.audio('explode');
    ughSound = game.add.audio('ugh');
    bellSound = game.add.audio('bell');
    bugleSound = game.add.audio('bugle');

    // Score text
    scoreText = game.add.text(16, 16, 'SCORE: 0', {fontSize: '32px',
                                                                fill: '#000'});

    // Health text
    livesText = game.add.text(600, 16, 'LIVES: 3', {fontSize: '32px',
                                                                  fill: '#000'});

    // Level text
    levelText = game.add.text(330, 16, 'LEVEL: 1', {fontSize: '32px',
                                                                    fill: '#F00'})

    // Set up our game controls
    cursors = game.input.keyboard.createCursorKeys();

}

function update() {

    // Set up collision detection
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.collide(baddie, platforms);
    game.physics.arcade.collide(player, baddie, checkLives);
    game.physics.arcade.collide(diamonds, platforms);

    // Check for overlap between player and any star in the stars group
    // If any overlap is detected, pass them to a callback function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    // Likewise for diamond
    game.physics.arcade.overlap(player, diamonds, collectDiamond, null, this);

    game.physics.arcade.moveToObject(baddie, player, baddieVelocity);

    if(player.alive) {

      // Reset the player's velocity
      player.body.velocity.x = 0;

      // Movement
      if(cursors.left.isDown) {

        // Move left
        player.body.velocity.x = -150;
        player.animations.play('left');

      } else if(cursors.right.isDown) {

        // Move right
        player.body.velocity.x = 150;
        player.animations.play('right');

      } else {
        player.animations.stop();
        player.frame = 4;
      }

      // Allow the player to jump if they are touching the ground
      if(cursors.up.isDown && player.body.touching.down) {
        player.body.velocity.y = -350;
      }
    }

    //Baddie animation left and right
    if(baddie.body.velocity.x < 0) {
      baddie.animations.play('left');
    } else {
      baddie.animations.play('right');
    }

    // Drop diamonds at random intervals approx. every 33 seconds
    if(Math.random() < .0005 ) {
      var diamond = diamonds.create((Math.random() * 700) + 50, 0, 'diamond');
      diamond.body.gravity.y = 10;
      diamond.body.collideWorldBounds = true;
    }

}

function launchBaddie() {

    // Create baddie
    baddie = game.add.sprite(game.world.width/2 - 200, 0, 'baddie')
    game.physics.arcade.enable(baddie);

    baddie.body.gravity.y = baddieGravity;
    baddie.body.bounce.y = 0.08;
    baddie.body.bounce.x = 1;
    baddie.body.collideWorldBounds = true;

    baddie.animations.add('left', [0, 1], 4, true);
    baddie.animations.add('right', [2, 3], 4, true);

}

function createStars() {

    // Create numStars stars spaced evenly apart
    for (var i = 0; i < numStars; i++) {

        // Create a star sprite and add to the stars group spacing each star 70px apart.
        var star = stars.create(i * 70, 0, 'star');
        star.body.gravity.y = 6;

        // Give each star a slightly random bounch between .7 and .9
        star.body.bounce.y = Math.random() * 0.2 + 0.7;
    }
}

function collectStar(player, star) {

  // update score and remove star
  star.kill();
  collectStarSound.play();

  score += 10;
  scoreText.text = 'SCORE: ' + score;

  // Check for remaining stars
  if(!stars.countLiving()) {

    bellSound.play();
    score += 500;
    scoreText.text = 'SCORE: ' + score;
    level++;
    levelText.text = 'LEVEL: ' + level;
    createStars();

    // Recreate baddie and increase his speed and gravity
    baddie.destroy();
    baddieVelocity += 20;
    baddieGravity += 1500;
    launchBaddie();

  }

}

function collectDiamond(player, diamond) {

  diamond.destroy();
  bugleSound.play();

  playerLives++;
  livesText.text = 'LIVES: ' + playerLives;

}

function checkLives(player) {
  if(playerLives > 1) {
    ughSound.play();
    playerLives--;
    livesText.text = 'LIVES: ' + playerLives;
    resetPlayer(player);
  } else {
    killPlayer(player);
  }
}

function resetPlayer(player) {
  player.x = 32;
  player.y = 150;
}

function killPlayer(player) {

  // Player dies
  player.alive = false;
  player.destroy(player);
  baddie.body.velocity.setTo(0, 0);
  explosion = game.add.sprite(player.x, player.y, 'explosion', 'explosion_1.png');
  explosion.animations.add('explode', ['explosion_1.png', 'explosion_2.png', 'explosion_3.png', 'explosion_4.png', 'explosion_5.png', 'explosion_6.png', 'explosion_7.png', 'explosion_8.png', 'explosion_9.png', 'explosion_10.png', 'explosion_11.png', 'explosion_12.png', 'explosion_13.png', 'explosion_14.png', 'explosion_15.png', 'explosion_16.png', 'explosion_17.png', 'explosion_18.png', 'explosion_19.png', 'explosion_20.png', 'explosion_21.png', 'explosion_22.png', 'explosion_23.png', 'explosion_24.png', 'explosion_25.png'], 30);
  explosion.animations.play('explode');
  deadSound.play();
  livesText.text = 'GAME OVER';

}
