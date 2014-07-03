
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'pong', { preload: preload, create: create, update: update});


function preload() {

	game.load.image('ball', 'assets/images/ball.png');
	game.load.image('paddle', 'assets/images/paddle.png');

}


var ball;

var player;
var enemy;

var playerScoreText;
var enemyScoreText

var scale = 8;
var paddleSpeed = 10;

var upKey;
var downKey;

function create() {

	// Set up score text
	var style = { font: "65px Arial", fill: "#FFFFFF", align: "center" };

	playerScoreText = game.add.text(game.world.centerX - 300, 20, '0', style);
	enemyScoreText = game.add.text(game.world.centerX + 250, 20, '0', style);

	// Set up sprites and scaling
	player = game.add.sprite(50, 200, 'paddle');
	enemy = game.add.sprite(720, 200, 'paddle');

	player.scale.x = scale;
	player.scale.y = scale;
	enemy.scale.x = scale;
	enemy.scale.y = scale;

	ball = game.add.sprite(400, 300, 'ball');

	ball.scale.x = scale;
	ball.scale.y = scale;

	// Set up physics system
	game.physics.startSystem(Phaser.Physics.ARCADE);

	game.physics.enable( [ ball, player, enemy ] , Phaser.Physics.ARCADE);

	ball.body.velocity.x = -300;
	ball.body.velocity.y = 100;
	ball.body.bounce.x = 1;
	ball.body.bounce.y = 1;

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
}

function update() {
	// Make the paddles and ball collide
	game.physics.arcade.collide(player, ball, null, null, this);
	game.physics.arcade.collide(enemy, ball, null, null, this);

	if (upKey.isDown) {
		player.y -= paddleSpeed;
	}

	if (downKey.isDown) {
		player.y += paddleSpeed;
	}

	// Make ball bounce
	if (ball.body.position.y < game.physics.arcade.bounds.y)
	{
		ball.body.position.y = game.physics.arcade.bounds.y;
		ball.body.velocity.y *= -ball.body.bounce.y;
		ball.body.blocked.up = true;
	}
	else if (ball.body.bottom > game.physics.arcade.bounds.bottom)
	{
		ball.body.position.y = game.physics.arcade.bounds.bottom - ball.body.height;
		ball.body.velocity.y *= -ball.body.bounce.y;
		ball.body.blocked.down = true;
	}

	// Handle scoring
	if (ball.body.position.x < game.physics.arcade.bounds.x)
	{
		// Enemy scores
		enemy.score++;
		resetBall();
	}
	else if (ball.body.right > game.physics.arcade.bounds.right)
	{
		// Player scores
		player.score++;
		resetBall();
	}

	playerScoreText.text = player.score;
	enemyScoreText.text = enemy.score;	
}

// Resets the ball to centre of court
function resetBall() {
	
	ball.body.position.x = 400;
	ball.body.position.y = 300;

	ball.body.velocity.x = -300;
	ball.body.velocity.y = 100;
}