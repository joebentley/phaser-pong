
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'pong', { preload: preload, create: create, update: update, render: render});


function preload() {

	game.load.image('ball', 'assets/images/ball.png');
	game.load.image('paddle', 'assets/images/paddle.png');

	game.load.audio('playerPoint', 'assets/sounds/point.wav');
	game.load.audio('enemyPoint', 'assets/sounds/enemy_point.wav');
	game.load.audio('ballHit', 'assets/sounds/tink.wav');

}


var ball;
var aiBall;

var player;
var enemy;

var playerScoreText;
var enemyScoreText

var scale = 8;
var paddleSpeed = 500;

var upKey;
var downKey;

var playerPointSfx;
var enemyPointSfx;
var ballHitSfx;

function create() {

	// Set up score text
	var style = { font: "65px Arial", fill: "#FFFFFF", align: "center" };

	playerScoreText = game.add.text(game.world.centerX - 300, 20, '0', style);
	enemyScoreText = game.add.text(game.world.centerX + 250, 20, '0', style);

	// Set up sprites
	player = game.add.sprite(50, 200, 'paddle');
	enemy = game.add.sprite(720, 200, 'paddle');

	player.scale.x = scale;
	player.scale.y = scale;
	enemy.scale.x = scale;
	enemy.scale.y = scale;

	ball = game.add.sprite(400, 300, 'ball');

	ball.scale.x = scale;
	ball.scale.y = scale;

	invisibleBall = game.add.sprite(0, 0);

	invisibleBall.scale.x = scale;
	invisibleBall.scale.y = scale;

	invisibleBall.active = false;


	// Set up physics system
	game.physics.startSystem(Phaser.Physics.ARCADE);

	game.physics.enable( [ ball, player, enemy, invisibleBall ] , Phaser.Physics.ARCADE);

	ball.body.velocity.x = -300;
	ball.body.velocity.y = 100;
	ball.body.bounce.x = 1;
	ball.body.bounce.y = 1;

	invisibleBall.body.bounce.x = 1;
	invisibleBall.body.bounce.y = 1;

	// We have to set the height and width manually as there is no graphic attached to this sprite
	invisibleBall.height = 16;
	invisibleBall.width = 16;


	// If the paddles aren't immovable they are bounced back by the ball
	player.body.immovable = true;
	player.body.collideWorldBounds = true;

	enemy.body.immovable = true;
	enemy.body.collideWorldBounds = true;

	// Set up input
	upKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
	downKey = game.input.keyboard.addKey(Phaser.Keyboard.S);

	// Initialize scores
	player.score = 0;
	enemy.score = 0;

	// Setup audio
	playerPointSfx = game.add.audio('playerPoint', 1, false);
	enemyPointSfx = game.add.audio('enemyPoint', 1, false);
	ballHitSfx = game.add.audio('ballHit', 1, false);
}

function update() {
	// Make the paddles and ball collide
	game.physics.arcade.collide(player, ball, collidePlayer, null, this);
	game.physics.arcade.collide(enemy, ball, collideEnemy, null, this);


	// Handle keyboard input
	if (upKey.isDown) {
		player.body.velocity.y = -500;
	}

	if (downKey.isDown) {
		player.body.velocity.y = 500;
	}

	if (!downKey.isDown && !upKey.isDown) {
		player.body.velocity.y = 0;
	}


	// Make enemy follow invisible ball if active, else move towards real ball
	if (invisibleBall.active) {
		enemy.body.position.y = invisibleBall.body.position.y;
	} else {
		game.physics.arcade.moveToXY(enemy, enemy.body.position.x, ball.body.position.y, 100);
	}


	// Disable invisible ball if it leaves world bounds
	if (invisibleBall.body.right > game.physics.arcade.bounds.right + 100) {
		invisibleBall.active = false;
	}

	// Make ball bounce when hitting ceiling or floor
	if (ball.body.position.y < game.physics.arcade.bounds.y)
	{
		ball.body.position.y = game.physics.arcade.bounds.y;
		ball.body.velocity.y *= -ball.body.bounce.y;
		ball.body.blocked.up = true;
		ballHitSfx.play();
	}
	else if (ball.body.bottom > game.physics.arcade.bounds.bottom)
	{
		ball.body.position.y = game.physics.arcade.bounds.bottom - ball.body.height;
		ball.body.velocity.y *= -ball.body.bounce.y;
		ball.body.blocked.down = true;
		ballHitSfx.play();
	}

	// and for the invisible ball...
	if (invisibleBall.body.position.y < game.physics.arcade.bounds.y)
	{
		invisibleBall.body.position.y = game.physics.arcade.bounds.y;
		invisibleBall.body.velocity.y *= -invisibleBall.body.bounce.y;
		invisibleBall.body.blocked.up = true;
	}
	else if (invisibleBall.body.bottom > game.physics.arcade.bounds.bottom)
	{
		invisibleBall.body.position.y = game.physics.arcade.bounds.bottom - invisibleBall.body.height;
		invisibleBall.body.velocity.y *= -invisibleBall.body.bounce.y;
		invisibleBall.body.blocked.down = true;
	}

	// Handle scoring
	if (ball.body.position.x < game.physics.arcade.bounds.x)
	{
		// Enemy scores
		enemy.score++;
		enemyPointSfx.play();

		resetBall();
	}
	else if (ball.body.right > game.physics.arcade.bounds.right)
	{
		// Player scores
		player.score++;
		playerPointSfx.play();

		resetBall();
	}

	playerScoreText.text = player.score;
	enemyScoreText.text = enemy.score;	
}

// Called when the ball hits the paddle
function collidePlayer (obj1, obj2) {
	ballHitSfx.play();

	// Add spin to players ball
	ball.body.velocity.y += player.body.velocity.y / 4;

	// Generate a new invisible ball that the enemy will follow, moving a little faster
	invisibleBall.body.position.x = ball.body.position.x;
	invisibleBall.body.position.y = ball.body.position.y;
	invisibleBall.body.velocity.x = ball.body.velocity.x * 1.4;
	invisibleBall.body.velocity.y = ball.body.velocity.y * 1.4;

	invisibleBall.active = true;
}

function collideEnemy (obj1, obj2) {
	ballHitSfx.play();
}

// Resets the ball to centre of court
function resetBall() {
	
	ball.body.position.x = 400;
	ball.body.position.y = 300;

	ball.body.velocity.x = -300;
	ball.body.velocity.y = 100;
}

function render() {
    //game.debug.spriteInfo(ball, 32, 32);
}