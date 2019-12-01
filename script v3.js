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
	dy: -15,
	name: "spaceship"
}
spaceship.dom.src = "img/8411198a-6d06-4631-b337-b54b4e498d21.png";

let laser = [];

let enemy = [];

let wave = [];
wave[0] = {
	numOfEnemies: 4,
};

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
let newWaveIsReady = true;

// need for enemies shooting every N seconds
let shootInterval = setInterval(() => {
	for (let i = 0; i < enemy.length; i++) {
		enemy[i].laser.push(new Laser());
	}
}, 2000);

draw();

// function declaration

function drawEnemyLaser(owner) {
	for (let i = 0; i < owner.laser.length; i++) {
		// checking laser existence
		if (!owner.laser[i].is) {
			// if its not exist give it spaceship coords
			owner.laser[i].is = true;
			owner.laser[i].x = owner.x + owner.width / 2;
			owner.laser[i].y = owner.y;
		} else {
			// when it goes out of screen give it no exist status

			if (owner.laser[i].y < canvas.height) {
				owner.laser[i].y -= owner.laser[i].dy;
			} else {
				owner.laser[i].is = false; 
			}
		}

		ctx.beginPath();
		ctx.fillStyle = "green";
		ctx.rect(owner.laser[i].x, owner.laser[i].y, owner.laser[i].width, owner.laser[i].height);
		ctx.fill();
		ctx.closePath();

		// if no exist more we delete it
		if (owner.laser[i].is == false) {
			owner.laser.splice(i, 1);
		}
	}
}

function startFirstWave(numberOfEnemies) {
	if (newWaveIsReady) {

		for (let i = 0; i < numberOfEnemies; i++) {
			enemy[i] = new Enemy();
			enemy[i].dom.src = "img/2719d02d1f7dee4f140da973c830353f.png";
			if (numberOfEnemies > 3) {
				enemy[i].x = i * (canvas.width / numberOfEnemies) + enemy[i].padding;
			} else {
				enemy[i].x = i * (canvas.width / numberOfEnemies) + enemy[i].padding + enemy[i].width;
			}
			enemy[i].y = 0 - enemy[i].height;
		}
		newWaveIsReady = false;

	}
}

function collisionDetection() {

	for (let i = 0; i < enemy.length; i++) {
		if (enemy[i].onPos) {
			// touches player
			if (enemy[i].x < spaceship.x + spaceship.width - 20 &&
				enemy[i].x > spaceship.x - enemy[i].width + 20 &&
				enemy[i].y > spaceship.y - enemy[i].height + 20&&
				enemy[i].y < spaceship.y + spaceship.height - 20) {
				alert("lose");
			}

			// touches another enemies
			for (let j = i + 1; j < enemy.length; j++) {
				
				if (enemy[i].x < enemy[j].x + enemy[j].width &&
					enemy[i].x > enemy[j].x - enemy[i].width &&
					enemy[i].y > enemy[j].y - enemy[i].height &&
					enemy[i].y < enemy[j].y + enemy[j].height) {

						enemy[i].dx = -enemy[j].dx;
						enemy[i].dy = -enemy[j].dy;
	
				}
				
			}

			// touches walls
			if (enemy[i].x > canvas.width - enemy[i].width || enemy[i].x < 0) {
				enemy[i].dx = -enemy[i].dx;
			}
			if (enemy[i].y > canvas.height - enemy[i].height || enemy[i].y < 0) {
				enemy[i].dy = -enemy[i].dy;
			}

			// enemy touches laser
			for (let j = 0; j < laser.length; j++) {
				if (laser[j].x < enemy[i].x + enemy[i].width - 20 &&
					laser[j].x > enemy[i].x &&
					laser[j].y > enemy[i].y &&
					laser[j].y < enemy[i].y + enemy[i].height) {
						enemy.splice(i, 1);
						laser.splice(j, 1);
				}
			}

		}

	}

}

function drawEnemies() {
	for (let i = 0; i < enemy.length; i++) {
		if (enemy[i].alive) {

			drawImage(enemy[i]);

			// descent of enemies on position
			if (enemy[i].y < enemy[i].padding) {
				enemy[i].y -= enemy[i].dy;
			} else {
				enemy[i].onPos = true;
			}

			moveEnemy(enemy[i]);
		}
	} 
}

function moveEnemy(mob) {
	if (mob.onPos) {

		// enemies will follow the player
		if (spaceship.y > mob.y) {
			mob.y -= mob.dy 
		}
		if (spaceship.y < mob.y) {
			mob.y += mob.dy 
		}
		if (spaceship.x > mob.x) {
			mob.x += mob.dx 
		}
		if (spaceship.x < mob.x) {
			mob.x -= mob.dx 
		}

	}
}

function drawLaser(owner) {
	for (let i = 0; i < laser.length; i++) {
		// checking laser existence
		if (!laser[i].is) {
			// if its not exist give it spaceship coords
			laser[i].is = true;
			laser[i].x = owner.x + owner.width / 2;
			laser[i].y = owner.y;
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
	startFirstWave(4);
	for (let i = 0; i < enemy.length; i++) {
		drawEnemyLaser(enemy[i]);
	}
	drawEnemies();
	
  // collisionDetection();
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
	drawLaser(spaceship);

	// collisionDetection();

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

// constructors

function Enemy() {
	this.width = 100;
	this.height = 100;
	this.padding = 50;
	this.dom = new Image();
	this.x = 0;
	this.y = 0;
	this.dx = 1.5;
	this.dy = -1;
	this.onPos = false;
	this.alive = true;
	this.laser = [];
}

function Laser() {
	this.dy = -20;
	this.width =  5;
	this.height =  40;
	this.is =  false;
	this.x = 0;
	this.y = 0;
}

