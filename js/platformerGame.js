var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {preload: preload, create: create, update: update});

var platforms,
    score = 0,
    numStars = 12,
    playerHealth = 3,
    healthText,
    scoreText;

function preload() {

    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.audio('collectStar', 'assets/collect_star.mp3');
    game.load.audio('boing', 'assets/boing.mp3');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.spritesheet('baddie', 'assets/baddie.png', 32, 32);

}


function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    // set up game's background
    game.add.sprite(0, 0, 'sky');

    platforms = game.add.group();

    // enable physics body on every member of the group
    platforms.enableBody = true;

    var ground = platforms.create(0, game.world.height - 64, 'ground');

    // Scale the ground to fit the width of the game
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
    //
    player = game.add.sprite(32, game.world.height -150, 'dude');

    // Enable physics on the player
    game.physics.arcade.enable(player);

    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    // Define two animations for our dude
    //      walking left and walking right
    //
    // They should run at 10 frames per second
    // and they should loop.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    // Create baddie
    baddie = game.add.sprite(game.world.width/2 - 80, 0, 'baddie')
    game.physics.arcade.enable(baddie);

    baddie.body.gravity.y = 500;
    baddie.body.bounce.y = 0.08;
    baddie.body.bounce.x = 1;
    baddie.body.collideWorldBounds = true;

    baddie.animations.add('left', [0, 1], 4, true);
    baddie.animations.add('right', [2, 3], 4, true);

    baddie.body.velocity.x = -50;
    baddie.animations.play('left');

    //
    // Drop a sprinkling of stars into the scene and allow
    // the player to collect them.
    //
    stars = game.add.group();

    stars.enableBody = true;

    // Create numStars stars spaced evenly apart
    for (var i = 0; i < numStars; i++) {

        // Create a star sprite and add to the stars group
        // spacing each star 70px apart.
        var star = stars.create(i * 70, 0, 'star');

        // Let gravity do its thing
        star.body.gravity.y = 6;

        // Give each star a slightly random bounch between .7 and .9
        star.body.bounce.y = Math.random() * 0.2 + 0.7;

    }

    // Add audio sounds
    collectStarSound = game.add.audio('collectStar');
    deadSound = game.add.audio('boing');

    // Set up  and display our score text
    scoreText = game.add.text(16, 16, 'SCORE: 0', {fontSize: '32px',
                                                                fill: '#000'});

    // Set up our game controls
    // Phaser has a builtin keyboard manager and one of its benefits
    // is the createCursorKeys method
    // This populates the cursors boject with four properties
    // up, down, left, right. These properties are instances
    // of Phaser.Key
    //
    // All we need to do after using this, is poll these in our update loop
    cursors = game.input.keyboard.createCursorKeys();

}

// Game loop
function update() {

    // Set up collision detection
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.collide(baddie, platforms);

    // Check for overlap between player and any star in the stars group
    // If any overlap is detected, pass them to a callback function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

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

    //Baddie movement back and forth
    if(baddie.body.velocity.x < 0) {
      baddie.animations.play('left');
    } else {
      baddie.animations.play('right');
    }

    // Baddie collision with player
    game.physics.arcade.overlap(player, baddie, killPlayer, null, this);


}

function collectStar(player, star) {

  // update score and remove star
  star.destroy();
  collectStarSound.play();

  score += 10;
  scoreText.text = 'SCORE: ' + score;

}

function killPlayer(player) {

  // Player dies
  player.destroy();
  deadSound.play();
  scoreText.text = 'YOU LOSE!!';

}
