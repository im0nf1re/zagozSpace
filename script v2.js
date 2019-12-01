"use strict"

let canvas = createElement("canvas", {className: "game-field"});
canvas.width = 1280;
canvas.height = 720;

document.body.append(canvas);

let ctx = canvas.getContext("2d");

// game objects
let spaceship = {
	dom: new Image(),
	x: canvas.width / 2 - 42,
	y: canvas.height - 120,
	width: 84,
	height: 120,
	dx: 15,
	dy: -15
}
spaceship.dom.src = "img/8411198a-6d06-4631-b337-b54b4e498d21.png";

let laser = [];

let enemyProps = {
	width: 100,
	height: 100,
	padding: 100,
	offsetLeft: 100,
	offsetTop: 100,
	number: 6,
	dx: 5,
	dy: -10
}
let enemy = [];
for (let i = 0; i < enemyProps.number; i++) {
	enemy[i] = {
		dom: new Image(),
		x: enemyProps.offsetLeft + i * (enemyProps.width + enemyProps.padding),
		y: 0 - enemyProps.height,
		width: enemyProps.width,
		height: enemyProps.height,
		onPos: false,
		status: true,
		laser: {
			dx: 30,
			dy: -10,
			width: 5,
			height: 40,
			is: false
		}
	}
	enemy[i].dom.src = "img/2719d02d1f7dee4f140da973c830353f.png";
}

// buttons for control 
let button = {
	up: false,
	down: false,
	left: false,
	right: false,
	space: false
};

// listeners for buttons
document.addEventListener("keydown", (e) => {
	if (e.repeat == false) {
		switch (e.code) {
			case "ArrowUp": button.up = true; break;
			case "ArrowDown": button.down = true; break;
			case "ArrowLeft": button.left = true; break;
			case "ArrowRight": button.right = true; break;
			case "Space": button.space = true; break;
		};
	}
});

document.addEventListener("keyup", (e) => {
	switch (e.code) {
		case "ArrowUp": button.up = false; break;
		case "ArrowDown": button.down = false; break;
		case "ArrowLeft": button.left = false; break;
		case "ArrowRight": button.right = false; break;
		case "Space": button.space = false; break;
	};
});

// game starts here
draw();

// function declaration

function enemyShoot(enemy) {
	if (!enemy.laser.is) {
		// if its not exist give it enemy coords
		enemy.laser.is = true;
		enemy.laser.x = enemy.x + enemy.width / 2;
		enemy.laser.y = enemy.y + enemy.height;
	} else {
		// when it goes out screen give it no exist status
		if (enemy.laser.y < canvas.height) {
			enemy.laser.y -= enemy.laser.dy;
		} else {
			enemy.laser.is = false;
		}
	}

	ctx.beginPath();
	ctx.fillStyle = "green";
	ctx.rect(enemy.laser.x, enemy.laser.y, enemy.laser.width, enemy.laser.height);
	ctx.fill();
	ctx.closePath();
}

// function collisionDetection() {
// 	for (let i = 0; i < enemyProps.number; i++) {
// 		if (laser.x <= enemy[i].x + enemyProps.width &&
// 				laser.x >= enemy[i].x &&
// 				laser.y <= enemy[i].y + enemyProps.height &&
// 				laser.y >= enemy[i].y) {
// 			enemy[i].status = false;
// 			laser.is = false;
// 			button.space = false;
// 		}

// 		if (enemy[i].laser.x <= spaceship.x + spaceship.width &&
// 			enemy[i].laser.x >= spaceship.x &&
// 			enemy[i].laser.y <= spaceship.y + spaceship.height &&
// 			enemy[i].laser.y >= spaceship.y) {
// 		enemy[i].laser.is = false;
// 		}
// 	}
// }

function drawEnemies() {
	for (let i = 0; i < enemyProps.number; i++) {
		if (enemy[i].status) {

			drawImage(enemy[i]);

			// descent of enemies on position
			if (enemy[i].y < enemyProps.offsetTop) {
				enemy[i].y -= enemyProps.dy;
			} else {
				enemy[i].onPos = true;

				enemyShoot(enemy[i]);
				// movement of enemies
				// console.log(Math.floor(Math.random() * (1 - 0 + 1)));
			}
		}
	} 
}

function drawLaser() {
	for (let i = 0; i < laser.length; i++) {
		// checking laser existence
		if (!laser[i].is) {
			// if its not exist give it spaceship coords
			laser[i].is = true;
			laser[i].x = spaceship.x + spaceship.width / 2;
			laser[i].y = spaceship.y;
		} else {
			// when it goes out of screen give it no exist status
			if (laser[i].y > 0) {
				laser[i].y += laser[i].dy;
			} else {
				laser[i].is = false; 
			}
		}

		ctx.beginPath();
		ctx.fillStyle = "red";
		ctx.rect(laser[i].x, laser[i].y, laser[i].width, laser[i].height);
		ctx.fill();
		ctx.closePath();

		// if no exist more we delete it
		if (laser[i].is == false) {
			laser.splice(i, 1);
		}
	}
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawImage(spaceship);
	drawEnemies();
	// controls for spaceship
	if (button.up && spaceship.y > 0) {
		spaceship.y += spaceship.dy;
	}
	if (button.down && spaceship.y < canvas.height - spaceship.height) {
		spaceship.y -= spaceship.dy;
	}
	if (button.left && spaceship.x > 0) {
		spaceship.x -= spaceship.dx;
	}
	if (button.right && spaceship.x < canvas.width - spaceship.width) {
		spaceship.x += spaceship.dx;
	}
	// shooting
	if (button.space) {
		laser.push(new Laser());
		button.space = false;
	}
	drawLaser();


	// condition of death of enemies
//	collisionDetection();

	// call next frame
	requestAnimationFrame(draw);
}

function drawImage(image) {
	ctx.drawImage(image.dom, image.x, image.y, image.width, image.height);
}

function createElement(tagName, props, ...children) {
	let elem = document.createElement(tagName);
	for (let prop in props) {
		elem[prop] = props[prop];
	}
	for (let i = 0; i < children.length; i++) {
		elem.append(children[i]);
	}

	return elem;
}

