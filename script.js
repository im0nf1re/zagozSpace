"use strict"

let canvas = createElement("canvas", {className: "game-field"});
canvas.width = 1280;
canvas.height = 720;
canvas.style.opacity = 1;

// sounds
let mainTheme = document.getElementById("mainTheme");
mainTheme.volume = 0.3;
mainTheme.loop = true;
let lose = document.getElementById("lose");
lose.volume = 0.3;
lose.loop = true;
let win = document.getElementById("win");
win.volume = 0.3;
win.loop = true;
let gameOverMusic;
let laserBlast = document.getElementById("laserBlast");
laserBlast.volume = 0.3;

let menu =	document.querySelector(".menu");

let startBtn = document.querySelector(".start");
let modeBtn = document.querySelector(".mode");
let musicBtn = document.querySelector(".music");

let ctx = canvas.getContext("2d");

let gameOver = false;
let numberOfWave = 0;
let stage = 0;
let transition = false;
let blacked = false;
let music = false;

// game objects

let border = {
	dom: new Image(),
	x: 0,
	y: canvas.height - 187,
	width: 183,
	height: 187
};
border.dom.src = "img/border.png";

let inGameFace = {
	dom: new Image(),
	x: 30,
	y: canvas.height - 157,
	width: 120,
	height: 122
};
inGameFace.dom.src = "img/inGameFace.png";

let heart = {
	dom: new Image(),
	x: 30,
	y: canvas.height - 50,
	width: 50,
	height: 50
};
heart.dom.src = "img/heartSprite.png";


let spaceship = {
	dom: new Image(),
	x: canvas.width / 2 - 42,
	y: canvas.height - 120,
	width: 84,
	height: 120,
	dx: 15,
	dy: -15,
	hp: 4,
	visible: true,
	attacked: false,
	opacity: 1,
	alive: true
};
spaceship.dom.src = "img/8411198a-6d06-4631-b337-b54b4e498d21.png";

let laser = [];

let enemy = [];

let wave = [];
wave[0] = {
	numOfEnemies: 4,
	newWaveIsReady: false
};
wave[1] = {
	numOfEnemies: 6,
	newWaveIsReady: false
};
wave[2] = {
	numOfEnemies: 7,
	newWaveIsReady: false
};

let boss = {
	width: 190,
	height: 200,
	padding: 100,
	dom: new Image(),
	x: canvas.width / 2 - 100,
	y: -200,
	dx: 1.5,
	dy: -1,
	onPos: false,
	alive: true,
	laser: [],
	awake: false,
	sphere: [],
	phase: 1,
	hp: 5,
	maxHp: 5,
	shield: {
		dom: new Image(),
		hp: 4,
		x: 0,
		y: 0,
		is: false,
		finished: false,
		width: 250,
		height: 250
	}, 
	visible: true,
	opacity: 1,
};
boss.dom.src = "img/bossShieldPrepare.png";
boss.shield.dom.src = "img/shieldSprire.png";
let sphereColor = "green";

// gameover face
let bitZagoz = {
	x: 0,
	y: 0,
	width: 385,
	height: 520,
	dom: new Image(),
};
bitZagoz.dom.src = "img/8BitZagoz.png";

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
		if (enemy[i].onPos)
			enemy[i].laser.push(new Laser());
	}
}, 2000);

// boss shooting
let shootSpeed = 500;
let sphereSpeed = 5;
let bossShootInterval = setInterval(() => {
	shootingSpheres();
	if (stage == 6) clearInterval(bossShootInterval);
}, shootSpeed); 

musicBtn.addEventListener("click", () => {
	if (!music) {
		mainTheme.play();
	} else {
		mainTheme.pause();
	}
	music = !music;
});

modeBtn.addEventListener("click", () => {
	showSettings();
});

startBtn.addEventListener("click", () => {
	menu.remove();
	startGame();
});

// function declaration

function godMod() {
	spaceship.hp = Infinity;
}

function showSettings() {
	let title = createElement("p", {className: "settings-title"});
	title.innerHTML = "Game mode:";
	let opFull = createElement("p", {className: "op-full"});
	opFull.innerHTML = "Full";
	let opBoss = createElement("p", {className: "op-boss"});
	opBoss.innerHTML = "Boss";

	let settingsWindow = createElement("div", {className: "settings-window"}, title, opFull, opBoss);

	menu.append(settingsWindow);

	opFull.addEventListener("click", () => {
		numberOfWave = 0;
		boss.awake = false;
		settingsWindow.remove();
	});

	opBoss.addEventListener("click", () => {
		numberOfWave = 3;
		boss.awake = true;
		settingsWindow.remove();
	});
}

function startGame() {
	document.body.append(canvas);
	draw();
}

function drawHpBar(obj) {
	ctx.globalAlpha = 1;

	ctx.beginPath();
	ctx.strokeStyle = "yellow";
	ctx.lineWidth = 3;
	ctx.rect(obj.x, obj.y - 40, obj.width, 25);
	ctx.stroke();
	ctx.closePath();
	
	let part = (obj.width - ctx.lineWidth * 2) / obj.maxHp;

	ctx.beginPath();
	ctx.fillStyle = "red";
	ctx.rect(obj.x + ctx.lineWidth, obj.y - 40 + ctx.lineWidth, obj.hp * part, 19);
	ctx.fill();
	ctx.closePath();
}

function shootingSpheres() {
	if (boss.onPos && boss.alive) {

		let sphere = new BossSphere();
		sphere.x = boss.x + boss.width / 2;
		sphere.y = boss.y + boss.width / 2;
		sphere.distanceX = sphere.x - spaceship.centerX;
		sphere.distanceY = sphere.y - spaceship.centerY;
		let kx = Math.abs(sphere.distanceX / sphere.distanceY);
		let ky = Math.abs(sphere.distanceY / sphere.distanceX);

		let part = sphereSpeed / (kx + ky);

		if (sphere.distanceX > 0) kx = -kx;
		if (sphere.distanceY > 0) ky = -ky;

		sphere.dx = part * kx;
		sphere.dy = part * ky;
		if (kx == 0) {
			sphere.dy = sphere.speed;
		}
		if (ky == 0) {
			sphere.dx = sphere.speed;
		}

		boss.sphere.push(sphere);

	}
}

function startPhase3() {
	transition = true;
	boss.hp = 5;

	let toPhase3Interval = setInterval(() => {
		stage++;

		if (stage == 6) {
			boss.phase = 3;
			boss.shield.is = true;
			boss.shield.hp = 4;
			boss.dx *= 2;
			boss.dy *= 2;
			sphereColor = "red";
			shootSpeed -= 300;
			sphereSpeed += 3; 
			transition = false;
			let newBossShootInterval = setInterval(shootingSpheres, shootSpeed);
			clearInterval(toPhase3Interval);
		}
	}, 1000); 
}

function startPhase2() {
	boss.hp = 5;
	transition = true;
	let toPhase2Interval = setInterval(() => {
		stage++;

		if (stage == 3) {
			boss.dx *= 1.6;
			boss.dy *= 1.6;
			boss.phase = 2;
			boss.shield.is = true;
			transition = false;
			clearInterval(toPhase2Interval);
		}
	}, 1000); 

}

function drawSphere() {
	for (let i = 0; i < boss.sphere.length; i++) {
				
		if (!boss.sphere[i].is) {
			boss.sphere[i].x = boss.x + boss.width / 2;
			boss.sphere[i].y = boss.y + boss.width / 2;

			boss.sphere[i].is = true;
		} else {
			boss.sphere[i].x += boss.sphere[i].dx;
			boss.sphere[i].y += boss.sphere[i].dy;
		}

		ctx.beginPath();
		ctx.fillStyle = sphereColor;
		ctx.arc(boss.sphere[i].x, boss.sphere[i].y, boss.sphere[i].radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();

		if (boss.sphere[i].x < -boss.sphere[i].radius ||
			boss.sphere[i].x > canvas.width + boss.sphere[i].radius ||
			boss.sphere[i].y < -boss.sphere[i].radius ||
			boss.sphere[i].y > canvas.height + boss.sphere[i].radius ||
			boss.sphere[i].is == false)
			boss.sphere.splice(i, 1);
	}
}

function drawShield() {
	boss.shield.x = boss.x - 30;
	boss.shield.y = boss.y - 30;
	if (boss.shield.is) {

		ctx.drawImage(boss.shield.dom, (4 - boss.shield.hp) * boss.shield.width, 0, boss.shield.width, boss.shield.height, boss.shield.x, boss.shield.y, boss.shield.width, boss.shield.height);
	}

	if (!boss.shield.hp) {
		boss.shield.is = false;
	}
}

function drawBossAttack() {
	if (boss.onPos) {
		if (boss.phase == 1) {
			drawSphere();
		}

		if (boss.phase == 2) {
			drawSphere();
			drawShield();
		}

		if (boss.phase == 3) {
			drawSphere();
			drawShield();
		}
	}
}

function stopGame() {
	
	if (spaceship.hp == 0) {
		setTimeout(() => {
			gameOver = true;
		}, 1000);
		spaceship.alive = false;
		inGameFace.dom.src = "img/inGameFaceDead.png";
	}
	

	if (boss.hp == 0 && boss.phase == 3 && boss.alive) {
		setTimeout(() => {
			boss.alive = false;
		}, 1000);
		stage++;
		
		boss.phase++;
	}
}

function setVisibility() {
	if (spaceship.attacked) {
		spaceship.opacity = 0.5;
		setTimeout(() => {
			spaceship.opacity = 1;
		}, 200);
		setTimeout(() => {
			spaceship.opacity = 0.5;
		}, 400);
		setTimeout(() => {
			spaceship.opacity = 1;
		}, 600);
		setTimeout(() => {
			spaceship.opacity = 0.5;
		}, 800);
		setTimeout(() => {
			spaceship.visible = true;
			spaceship.opacity = 1;
		}, 1000);
		spaceship.attacked = false;
	}

	if (boss.attacked) {
		boss.opacity = 0.5;
		setTimeout(() => {
			boss.opacity = 1;
		}, 200);
		setTimeout(() => {
			boss.opacity = 0.5;
		}, 400);
		setTimeout(() => {
			boss.opacity = 1;
		}, 600);
		setTimeout(() => {
			boss.opacity = 0.5;
		}, 800);
		setTimeout(() => {
			boss.opacity = 1;
			boss.visible = true;
		}, 1000);
		boss.attacked = false;
	}
}

function drawHeart() {
		ctx.drawImage(heart.dom, (4 - spaceship.hp) * heart.width, 0, heart.width, heart.height, heart.x, heart.y, heart.width, heart.height);
}

function drawBoss() {
	drawHpBar(boss);
	ctx.globalAlpha = boss.opacity;

	if (boss.awake) {

		ctx.drawImage(boss.dom, stage * boss.width, 0, boss.width, boss.height, boss.x, boss.y, boss.width, boss.height);

		if (boss.y < boss.padding) {
			boss.y -= boss.dy;
		} else {
			boss.onPos = true;
		}

		moveEnemy(boss);

		if (boss.y > canvas.height) {
				gameOver = true;		
		}
	}
}

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

function startWave() {
	if (numberOfWave < 3) {

		if (!wave[numberOfWave].newWaveIsReady) {

			for (let i = 0; i < wave[numberOfWave].numOfEnemies; i++) {
				enemy[i] = new Enemy();
				enemy[i].dom.src = "img/2719d02d1f7dee4f140da973c830353f.png";
				if (wave[numberOfWave].numOfEnemies > 3) {
					enemy[i].x = i * (canvas.width / wave[numberOfWave].numOfEnemies) + enemy[i].padding;
				} else {
					enemy[i].x = i * (canvas.width / wave[numberOfWave].numOfEnemies) + enemy[i].padding + enemy[i].width;
				}
				enemy[i].y = 0 - enemy[i].height;
			}
			wave[numberOfWave].newWaveIsReady = true;

		}
 
		// when ends last wave we waiting some time and call boss
		if (wave[numberOfWave].newWaveIsReady && !enemy.length) {
			if (numberOfWave == 2) {

				let timeout = setTimeout(() => {
					console.log("boss awake!");
					boss.awake = true;
					clearTimeout(timeout);
				}, 2000);
				numberOfWave++;

			} else numberOfWave++;
		}

	}
}

function collisionDetection() {

	// for enemy
	for (let i = 0; i < enemy.length; i++) {
		if (enemy[i].onPos) {

			// touches player
			if (isContact(enemy[i], spaceship) &&
				spaceship.visible) {

					spaceship.hp--;
					spaceship.visible = false;
					spaceship.attacked = true;
			}

			// touches another enemies
			for (let j = i + 1; j < enemy.length; j++) {
				
				if (isContact(enemy[i], enemy[j])) {

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
				if (isContact(enemy[i], laser[j])) {
						enemy.splice(i, 1);
						laser.splice(j, 1);
				}
			}

			for (let i = 0; i < enemy.length; i++) {
				for (let j = 0; j < enemy[i].laser.length; j++) {
					if (isContact(spaceship, enemy[i].laser[j]) && spaceship.visible) {
						spaceship.hp--;
						spaceship.visible = false;
						spaceship.attacked = true;
						enemy[i].laser.splice(j, 1);
					}
				}
			}
		} 
	}

	// for boss

	if (boss.onPos) {
		if (isContact(boss, spaceship) &&
			spaceship.visible) {

				spaceship.hp--;
				spaceship.visible = false;
				spaceship.attacked = true;
		}

		// touches walls
		if (boss.x > canvas.width - boss.width || boss.x < 0) {
			boss.dx = -boss.dx;
		}
		if (boss.y > canvas.height - boss.height || boss.y < 0) {
			boss.dy = -boss.dy;
		}

		// touches laser 
		for (let i = 0; i < laser.length; i++) {
			// shield touches laser
			if (boss.shield.is &&
				isContact(boss.shield, laser[i])) {
					boss.shield.hp--;
					laser.splice(i, 1);
					if (boss.shield.hp == 0) {
						boss.shield.is = false;
					}
			}
		}

		for (let i = 0; i < laser.length; i++) {
			if (isContact(boss, laser[i]) && boss.visible) {
				boss.hp--;
				boss.visible = false;
				boss.attacked = true;
				laser.splice(i, 1);
			}
		}

		for (let i = 0; i < boss.sphere.length; i++) {
			if (isContact(spaceship, boss.sphere[i]) && spaceship.visible) {
				spaceship.hp--;
				spaceship.visible = false;
				spaceship.attacked = true;
				boss.sphere.splice(i, 1);
			}
		}
	}
}

function isContact(a, b) {
	if (a.x < b.x + b.width - 10 &&
		a.x > b.x - a.width + 10 &&
		a.y > b.y - a.height + 10 &&
		a.y < b.y + b.height - 10)	return true;
		else return false;
}

function drawEnemies() {
	for (let i = 0; i < enemy.length; i++) {
		if (enemy[i].alive) {

			drawImage(enemy[i]);

			// descent of enemies on position
			if (enemy[i].y < enemy[i].padding && !enemy[i].onPos) {
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
		if (boss.alive) {
			if (boss.phase == 3) {
				boss.x += boss.dx;
				boss.y -= boss.dy;
			} else {
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
			
		} else {
			boss.y++;
			if (mainTheme.volume > 0.001) mainTheme.volume -= 0.001;
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

function drawSpaceship() {
	ctx.globalAlpha = spaceship.opacity;
	if (!spaceship.alive) {
		if (mainTheme.volume > 0.005) mainTheme.volume -= 0.005;
	}
	drawImage(spaceship);
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawSpaceship();
	spaceship.centerX = spaceship.x + spaceship.width / 2;
	spaceship.centerY = spaceship.y + spaceship.height / 2;
	startWave();

	drawBoss();

	if (boss.alive && spaceship.alive) {	
		for (let i = 0; i < enemy.length; i++) {
			drawEnemyLaser(enemy[i]);
		}

		ctx.globalAlpha = 1;
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
			laserBlast.pause();
			laserBlast.currentTime = 0;
			laserBlast.play();
			
			laser.push(new Laser());
			button.space = false;
		}
		drawBossAttack();
		drawLaser(spaceship);
		collisionDetection();
		if (boss.hp == 0) {
			switch (boss.phase) {
				case 1: startPhase2(); break;
				case 2: startPhase3(); break;
			}
		}
	}
	drawImage(border);
	drawImage(inGameFace);
	drawHeart();
	setVisibility();
	stopGame();

	// call next frame
	if (!gameOver) requestAnimationFrame(draw);
	else { 
			ctx.globalAlpha = 0;
			drawGameOverFace();
	}
	
}

function drawGameOverFace() {
	if (!blacked) {
		ctx.beginPath();
		ctx.fillStyle = "black";
		ctx.rect(0, 0, canvas.width, canvas.height);
		ctx.fill();
		ctx.closePath();
		if (ctx.globalAlpha < 0.99) ctx.globalAlpha += 0.01;
		else blacked = true;
	} else {
		// win/lose music
		mainTheme.pause();
		if (spaceship.alive) {
			gameOverMusic = win;
		} else {
			gameOverMusic = lose;
		}
		gameOverMusic.play();

		// draw face
		ctx.clearRect(0,0,canvas.width,canvas.height);

		ctx.beginPath();
		ctx.fillStyle = "black";
		ctx.rect(0, 0, canvas.width, canvas.height);
		ctx.fill();
		ctx.closePath();

		bitZagoz.x = canvas.width / 2 - bitZagoz.width / 2;
		bitZagoz.y = canvas.height / 2 - bitZagoz.height / 2;
		let text;
		if (spaceship.alive) {
			text = "the end";
			gameOverMusic = win;
		} else {
			bitZagoz.dom.src = "img/8бит2загоз.png";
			text = "RIP2017";
			gameOverMusic = lose;
		}
		drawImage(bitZagoz);

		ctx.fillStyle = 'white';
		ctx.font = '100px PressStart2P';
		ctx.fillText(text, canvas.width / 2 - 350, 120);

		if (bitZagoz.width < 770) bitZagoz.width += 30;
	}
	
	requestAnimationFrame(drawGameOverFace);
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

function BossSphere() {
	this.dy = 0;
	this.dx = 0;
	this.radius =  15;
	this.width = 30;
	this.height = 30;
	this.is =  false;
	this.x = 0;
	this.y = 0;
	this.endpointX = 0;
	this.endpointY = 0;
	this.color = "green";
}

