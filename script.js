window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    const selectedBackground = localStorage.getItem('selectedBackground');
    canvas.width = 1200;
    canvas.height = 600;
    const backgroundMusic = new Audio('assets/sounds/bg_music.mp3');
    backgroundMusic.loop = true;


    class InputHandler {
        constructor(game){
            this.game = game;
            window.addEventListener('keydown', e => {
                if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && this.game.keys.indexOf(e.key) === -1) {
                    this.game.keys.push(e.key);
                } else if (e.key === ' ') {
                    this.game.player.shootTop();
                    this.game.shootSound.volume = 0.8;
                    this.game.shootSound.play();
                }
            });
            window.addEventListener('keyup', e => {
                const index = this.game.keys.indexOf(e.key);
                if (index > -1) this.game.keys.splice(index, 1);
            });
        }
    }

    class Projectile {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.markedForDeletion = false;
            this.image=document.getElementById('shoot');
        }
        update() {
            this.x += this.speed;
            if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y);
        }
    }

    class Particle{
        constructor(game, x, y){
            this.game=game;
            this.x=x;
            this.y=y;
            this.image = document.getElementById('gear');
            this.frameX=Math.floor(Math.random()*3);
            this.frameY=Math.floor(Math.random()*3);
            this.spriteSize=50;
            this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
            this.size=this.spriteSize*this.sizeModifier;
            this.speedX=Math.random() * 6 - 3;
            this.speedY=Math.random() * -15;
            this.gravity=0.5;
            this.markedForDeletion=false;
            this.angle=0;
            this.srot=Math.random() * 0.2 - 0.1;
        }
        update(){
            this.angle+=this.srot;
            this.speedY+=this.gravity;
            this.x-=this.speedX+this.game.speed;
            this.y+=this.speedY;
            if(this.y>this.game.height+this.size || this.x<0-this.size){
                this.markedForDeletion=true;
            }
        }
        draw(context){
            context.save();
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.drawImage(this.image, this.frameX*this.spriteSize, this.frameY*this.spriteSize, this.spriteSize, this.spriteSize, this.spriteSize * -0.5, this.spriteSize * -0.5, this.size, this.size);
            context.restore();
        }
    }

    class Player {
        constructor(game) {
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 150;
            this.y = 100;
            this.frameX=0;
            this.frameY=0;
            this.maxFrame=37;
            this.speedY = 0; 
            this.maxSpeed = 3; 
            this.projectiles = [];
            this.image = document.getElementById('player');
            this.powerUp=false;
            this.powerUpTimer=0;
            this.powerUpLimit=10000;
        }
    
        update(deltaTime) {
            if (this.game.keys.includes('ArrowUp')) {
                this.speedY = -this.maxSpeed;
            } else if (this.game.keys.includes('ArrowDown')) {
                this.speedY = this.maxSpeed;
            } else {
                this.speedY = 0;
            }
            this.y += this.speedY;
            if (this.y < 0) this.y = 0;
            if (this.y + this.height > this.game.height) this.y = this.game.height - this.height;

            this.projectiles.forEach(projectile => projectile.update());
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
            if(this.frameX < this.maxFrame){
                this.frameX++;
            }
            else{
                this.frameX=0;
            }
            if(this.powerUp){
                if(this.powerUpTimer>this.powerUpLimit){
                    this.powerUpTimer=0;
                    this.powerUp=false;
                    this.frameY=0;
                }
                else{
                    this.powerUpTimer+=deltaTime;
                    this.frameY=1;
                    this.game.ammo+=0.1;
                }
            }
        }
    
        draw(context) {
            context.drawImage(
                this.image,
                this.frameX*this.width,
                this.frameY*this.height,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height
            );
            this.projectiles.forEach(projectile => projectile.draw(context));
        }
    
        shootTop() {
            if (this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + this.width, this.y + this.height / 2));
                this.game.ammo--;
            }
            if(this.powerUp){
                this.shootBottom();
            }
        }
        
        shootBottom(){
            if(this.game.ammo>0){
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 180));
                this.game.ammo--;
            }
        }

        enterPowerUp(){
            this.powerUpTimer=0;
            this.powerUp=true;
            this.game.ammo=this.game.maxAmmo;
        }
    }
    

    class Enemy {
        constructor(game) {
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.markedForDeletion = false;
            this.lives = 5;
            this.score = this.lives;
            this.frameX=0;
            this.frameY=0;
            this.maxFrame=37;
        }
        update() {
            this.x += this.speedX-this.game.speed;
            if (this.x + this.width < 0) this.markedForDeletion = true;
            if(this.frameX<this.maxFrame){
                this.frameX++;
            }
            else{
                this.frameX=0;
            }
        }
        draw(context) {
            context.drawImage(this.image, this.frameX*this.width, this.frameY*this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }
    }

    class Enemy1 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 228;
            this.height = 169;
            this.lives = 5;
            this.score = this.lives;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image=document.getElementById('enemy1');
            this.frameY=Math.floor(Math.random()*3)
        }
    }

    class Enemy2 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 213;
            this.height = 169;
            this.lives = 6;
            this.score = this.lives;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image=document.getElementById('enemy2');
            this.frameY=Math.floor(Math.random()*2)
        }
    }

    class Enemy3 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 99;
            this.height = 95;
            this.lives = 5;
            this.score = 15;
            this.type='e3';
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image=document.getElementById('enemy3');
            this.frameY=Math.floor(Math.random()*2);
        }
    }

    class Enemy4 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 400;
            this.height = 227;
            this.lives = 20;
            this.score = this.lives ;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image=document.getElementById('enemy4');
            this.frameY=0;
            this.type = 'bige1';
        }
    }

    class Enemy5 extends Enemy {
        constructor(game, x, y) {
            super(game);
            this.width = 115;
            this.height = 95;
            this.x = x;
            this.y=y;
            this.lives = 3;
            this.score = this.lives;
            this.frameY = Math.floor(Math.random()*2);
            this.image=document.getElementById('enemy5');
            this.type = 'bige2';
            this.speedX = Math.random() * -4.2 - 0.5;
        }
    }

    class Layer {
        constructor(game, image, speedModifier){
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width=1768;
            this.height=500;
            this.x=0;
            this.y=0;
        }
        update(){
            if(this.x <= -this.width) this.x = 0;
            this.x -= this.game.speed * this.speedModifier;
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y);
        }
    }

    class Background {
        constructor(game, backgroundNumber){
            this.game = game;
            this.image1 = document.getElementById(`bg${backgroundNumber}_layer1`);
            this.image2 = document.getElementById(`bg${backgroundNumber}_layer2`);
            this.image3 = document.getElementById(`bg${backgroundNumber}_layer3`);
            this.image4 = document.getElementById(`bg${backgroundNumber}_layer4`);
            this.image5 = document.getElementById(`bg${backgroundNumber}_layer5`);
            this.image6 = document.getElementById(`bg${backgroundNumber}_layer6`);
            this.layer1 = new Layer(this.game, this.image1, 0.2);
            this.layer2 = new Layer(this.game, this.image2, 0.3);
            this.layer3 = new Layer(this.game, this.image3, 0.5);
            this.layer4 = new Layer(this.game, this.image4, 0.7);
            this.layer5 = new Layer(this.game, this.image5, 0.9);
            this.layer6 = new Layer(this.game, this.image6, 1.2);
            this.layers=[this.layer1, this.layer2, this.layer3, this.layer4, this.layer5, this.layer6];
        }
        update(){
            this.layers.forEach(layer => layer.update());
        }
        draw(context){
            this.layers.forEach(layer =>layer.draw(context));
        }
    }

    class UI {
        constructor(game) {
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Press Start 2P';
            this.color = 'white';
        }
    
        draw(context) {
            context.save();
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
    
            context.font = this.fontSize + 'px "' + this.fontFamily + '"';
            context.fillText('Score: ' + this.game.score, 20, 40);
    
            for (let i = 0; i < this.game.ammo; i++) {
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }
    
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText("Timer: " + formattedTime, 20, 100);
    
            if (this.game.gameOver) {
                context.textAlign = 'center';
                let message1;
                let message2;
    
                if (this.game.score > this.game.winningScore) {
                    message1 = "THE FIRE'S BURNING!";
                    message2 = "You did it!";
                    this.game.winSound.play();
                } else {
                    message1 = "AW SHUCKS!";
                    message2 = "Get back to your base!";
                    this.game.loseSound.play();
                }
    
                context.font = '50px "' + this.fontFamily + '"';
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 40);
                context.font = '25px "' + this.fontFamily + '"';
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 40);

                const resetButton = document.getElementById("restart");
                resetButton.style.display = "block"; 
                const buttonYPosition = this.game.width * 0.2; 
                const buttonWidth = this.game.height * 0.3;
                const buttonHeight = 50;
                resetButton.style.marginTop = `${buttonYPosition}px`;
                resetButton.style.width = `${buttonWidth}px`;
                resetButton.style.height = `${buttonHeight}px`;
            }    
            context.restore();
        }
    }
    
    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.bgnum = localStorage.getItem('selectedBackground');
            this.shootSound = new Audio('assets/sounds/shoot.mp3');
            this.collisionSound = new Audio('assets/sounds/collision.mp3');
            this.winSound = new Audio('assets/sounds/victory.mp3');
            this.loseSound = new Audio('assets/sounds/lose.mp3');
            this.background=new Background(this, this.bgnum);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.particles=[];
            this.enemyTimer = 0;
            this.enemyInterval = 2000;
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 350;
            this.gameOver = false;
            this.score=0;
            this.winningScore=80;
            this.gameTime = 0;
            this.timeLimit = 30000;
            this.speed=1;
            this.resetButton=document.getElementById("restart");
        }
        update(deltaTime) {
            if(!this.gameOver) this.gameTime += deltaTime;
            if(this.gameTime > this.timeLimit){
                this.gameOver=true;
                document.querySelector('.restart-btn').addEventListener('click', function(){
                    window.location.href = 'index.html';
                });
            }
            this.background.update();
            this.player.update(deltaTime);
            if (this.ammoTimer > this.ammoInterval) {
                if (this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }
            this.particles.forEach(particle=>particle.update());
            this.particles=this.particles.filter(particle => !particle.markedForDeletion)
            this.enemies.forEach(enemy => {
                enemy.update()
                if(this.checkCollision(this.player, enemy)){
                    enemy.markedForDeletion=true;
                    this.collisionSound.currentTime = 0;
                    this.collisionSound.play();
                    for(let i=0;i<enemy.score;i++){
                        this.particles.push(new Particle(this, enemy.x + enemy.width*0.2, enemy.y + enemy.height*0.2));
                    }
                    if(enemy.type === 'e3'){
                        this.player.enterPowerUp();
                    }
                    else if(!this.gameOver && this.score!=0){
                        this.score-=2;
                    }
                }
                this.player.projectiles.forEach(projectile => {
                    if(this.checkCollision(projectile, enemy)){
                        enemy.lives--;
                        projectile.markedForDeletion=true;
                        if(enemy.lives <=0){
                            for(let i=0;i<enemy.score;i++){
                                this.particles.push(new Particle(this, enemy.x + enemy.width*0.5, enemy.y + enemy.height*0.5));
                            }
                            enemy.markedForDeletion=true;
                            if(enemy.type === 'bige1'){
                                for(let i=0; i<5; i++){
                                    this.enemies.push(new Enemy5(this, enemy.x + Math.random() * enemy.width, enemy.y + 0.5 * enemy.width));
                                }
                            }
                            if(!this.gameOver) this.score+=enemy.score;
                            /*if(this.score > this.winningScore) this.gameOver=true;*/
                        }
                    }
                })
            });
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
        }
        draw(context) {
            this.background.draw(context);
            this.player.draw(context);
            this.ui.draw(context);
            this.particles.forEach(particle=>particle.draw(context));
            this.enemies.forEach(enemy => enemy.draw(context));
        }
        addEnemy() {
            const r=Math.random();
            if(r<0.3){
                this.enemies.push(new Enemy1(this));
            }
            else if(r<0.6){
                this.enemies.push(new Enemy2(this));
            }
            else if(r<0.8){
                this.enemies.push(new Enemy4(this));
            }
            else{
                this.enemies.push(new Enemy3(this));
            }
            
        }        
        checkCollision(rect1, rect2){
            return(
                rect1.x < rect2.x +rect2.width && rect1.x+rect1.width > rect2.x && rect1.y < rect2.y +rect2.height && rect1.height + rect1.y > rect2.y
            )
        }
    }

    const game = new Game(canvas.width, canvas.height);
    backgroundMusic.volume = 0.4;
    backgroundMusic.play();
    let lastTime = 0;
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate(0);
});