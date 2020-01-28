(function () {
    'use strict';
    window.addEventListener('load', init, false);
    var canvas = null,
        ctx = null,
        x = 50,
        y = 50,
        lastPress = null,
        pause = true,
        gameover = true,
        score = 0,
        enemies = [],
        pressing = [],
        KEY_LEFT = 37,
        KEY_UP = 38,
        KEY_RIGHT = 39,
        KEY_DOWN = 40,
        KEY_ENTER = 13,
        KEY_SPACE = 32,
        player = new Rectangle(225, 650, 10, 10, 0, 3),
        shots = [],
        powerups = [],
        multishot = 1,
        messages = [],
        elapsedTime = 0,
        spritesheet = new Image();
    spritesheet.src = 'assets/spritesheet.png';

    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 17);
            };
    }());

    function random(max) {
        return ~~(Math.random() * max);
    }
    function reset() {
        score = 0;
        multishot = 1;
        player.x = 225;
        player.y = 650;
        player.health = 3;
        player.timer = 0;
        shots.length = 0;
        enemies.length = 0;
        powerups.length = 0;
        messages.length = 0;
        enemies.push(new Rectangle(10, 0, 10, 10, 0, 2));
        enemies.push(new Rectangle(140, 0, 10, 10, 0, 2));
        enemies.push(new Rectangle(27, 0, 10, 10, 0, 2));
        enemies.push(new Rectangle(400, 0, 10, 10, 0, 2));
        gameover = false;
    }
    function paint(ctx) {
        // Clean canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw body
        ctx.strokeStyle = '#0f0';
        if (player.timer % 2 == 0)
            //player.fill(ctx);
            player.drawImageArea(ctx, spritesheet, (~~(elapsedTime * 10) % 3) * 10, 0, 10, 10);
        // Draw shots
        ctx.strokeStyle = '#f00';
        for (var i = 0, l = shots.length; i < l; i++)
            shots[i].drawImageArea(ctx, spritesheet, 70, (~~(elapsedTime * 10) % 2) * 5, 5, 5);
        //ctx.fillText('Shots: ' + shots.length, 0, 30);
        // Debug last key pressed
        ctx.fillStyle = '#fff';
        // Draw pause
        if (pause) {
            ctx.textAlign = 'center';
            if (gameover)
                ctx.fillText('GAME OVER', 235, 350);
            else
                ctx.fillText('PAUSE', 235, 350);
            ctx.textAlign = 'left';
        }
        // Draw enemies
        for (var i = 0, l = enemies.length; i < l; i++) {
            if (enemies[i].timer % 2 == 0) {
                ctx.strokeStyle = '#00f';
                enemies[i].drawImageArea(ctx, spritesheet, 30, 0, 10, 10);
            }
            else {
                ctx.strokeStyle = '#fff';
                enemies[i].drawImageArea(ctx, spritesheet, 40, 0, 10, 10);
            }
        }
        // Draw score
        ctx.fillStyle = '#fff';
        ctx.fillText('Score: ' + score, 0, 20);
        // Draw remaining health
        ctx.fillText('Health: ' + player.health, 210, 20);
        // Draw powerups
        for (var i = 0, l = powerups.length; i < l; i++) {
            if (powerups[i].type == 1) {
                ctx.strokeStyle = '#f90';
                powerups[i].drawImageArea(ctx, spritesheet, 50, 0, 10, 10);
            }
            else {
                ctx.strokeStyle = '#cc6';
                powerups[i].drawImageArea(ctx, spritesheet, 60, 0, 10, 10);
            }
        }
        // Draw messages
        for (var i = 0, l = messages.length; i < l; i++)
            ctx.fillText(messages[i].string, messages[i].x, messages[i].y);
    }

    function act(deltaTime) {
        if (!pause) {
            // GameOver Reset
            if (gameover)
                reset();
            // Move Rect
            /* if (pressing[KEY_UP])
                y -= 10; */
            if (pressing[KEY_RIGHT])
                player.x += 10;
            /* if (pressing[KEY_DOWN])
                y += 10; */
            if (pressing[KEY_LEFT])
                player.x -= 10;
            // Out Screen
            if (player.x > canvas.width - player.width)
                player.x = canvas.width - player.width;
            if (player.x < 0)
                player.x = 0;
            // New Shot
            if (lastPress == KEY_SPACE) {
                if (multishot == 3) {
                    shots.push(new Rectangle(player.x - 3, player.y + 2, 6, 6));
                    shots.push(new Rectangle(player.x + 3, player.y, 6, 6));
                    shots.push(new Rectangle(player.x + 9, player.y + 2, 6, 6));
                }
                else if (multishot == 2) {
                    shots.push(new Rectangle(player.x, player.y, 6, 6));
                    shots.push(new Rectangle(player.x + 5, player.y, 6, 6));
                }
                else
                    shots.push(new Rectangle(player.x + 3, player.y, 6, 6));
                lastPress = null;
            }
            // Move Shots
            for (var i = 0, l = shots.length; i < l; i++) {
                shots[i].y -= 10;
                if (shots[i].y < 0) {
                    shots.splice(i--, 1);
                    l--;
                }
            }
            // Move Messages
            for (var i = 0, l = messages.length; i < l; i++) {
                messages[i].y += 2;
                if (messages[i].y < 650) {
                    messages.splice(i--, 1);
                    l--;
                }
            }
            // Move PowerUps
            for (var i = 0, l = powerups.length; i < l; i++) {
                powerups[i].y += 10;
                // Powerup Outside Screen
                if (powerups[i].y > canvas.height) {
                    powerups.splice(i--, 1);
                    l--;
                    continue;
                }
                // Player intersects
                if (player.intersects(powerups[i])) {
                    if (powerups[i].type == 1) { // MultiShot
                        if (multishot < 3) {
                            multishot++;
                            messages.push(new Message('MULTI', player.x, player.y));
                        }
                        else {
                            score += 5;
                            messages.push(new Message('+5', player.x, player.y));
                        }
                    }
                    else { // ExtraPoints
                        score += 5;
                        messages.push(new Message('+5', player.x, player.y));
                    }
                    powerups.splice(i--, 1);
                    l--;
                }
            }

            // Move Enemies
            for (var i = 0, l = enemies.length; i < l; i++) {
                // Shot hit
                if (enemies[i].timer > 0)
                    enemies[i].timer--;
                // Shot Intersects Enemy
                for (var j = 0, ll = shots.length; j < ll; j++) {
                    if (shots[j].intersects(enemies[i])) {
                        score++;
                        enemies[i].health--;
                        if (enemies[i].health < 1) {
                            // Add powerup
                            // Add PowerUp
                            var r = random(20);
                            if (r < 5) {
                                if (r == 0) // New MultiShot
                                    powerups.push(new Rectangle(enemies[i].x, enemies[i].y, 10, 10, 1));
                                else // New ExtraPoints
                                    powerups.push(new Rectangle(enemies[i].x, enemies[i].y, 10, 10, 0));
                            }
                            enemies[i].x = random(canvas.width / 10) * 10;
                            enemies[i].y = 0;
                            enemies[i].health = 2;
                            enemies.push(new Rectangle(random(canvas.width / 10) * 10, 0, 10, 10, 0, 2));
                        }
                        else {
                            enemies[i].timer = 1;
                        }
                        shots.splice(j--, 1);
                        ll--;
                    }
                }
                enemies[i].y += 10;
                if (enemies[i].y > canvas.height) {
                    enemies[i].x = random(canvas.width / 10) * 10;
                    enemies[i].y = 0;
                    enemies[i].health = 2;
                }
                // Player Intersects Enemy
                if (player.intersects(enemies[i]) && player.timer < 1) {
                    player.health--;
                    player.timer = 20;
                }
                // Shot Intersects Enemy
                for (var j = 0, ll = shots.length; j < ll; j++) {
                    if (shots[j].intersects(enemies[i])) {
                        score++;
                        enemies[i].health--;
                        if (enemies[i].health < 1) {
                            enemies[i].x = random(canvas.width / 10) * 10;
                            enemies[i].y = 0;
                            enemies[i].health = 2;
                            enemies.push(new Rectangle(random(canvas.width / 10) * 10, 0, 10, 10, 0, 2));
                        }
                        else {
                            enemies[i].timer = 1;
                        }
                        shots.splice(j--, 1);
                        ll--;
                    }
                }
            }
            // Elapsed time
            elapsedTime += deltaTime;
            if (elapsedTime > 3600)
                elapsedTime -= 3600;
            // Damaged
            if (player.timer > 0)
                player.timer--;
            // GameOver
            if (player.health < 1) {
                gameover = true;
                pause = true;
            }
        }
        // Pause/Unpause
        if (lastPress == KEY_ENTER) {
            pause = !pause;
            lastPress = null;
        }
    }
    function Rectangle(x, y, width, height, type, health) {
        this.x = (x == null) ? 0 : x;
        this.y = (y == null) ? 0 : y;
        this.width = (width == null) ? 0 : width;
        this.height = (height == null) ? this.width : height;
        this.type = (type == null) ? 1 : type;
        this.health = (health == null) ? 1 : health;
        this.timer = 0;
    }
    Rectangle.prototype.intersects = function (rect) {
        if (rect != null) {
            return (this.x < rect.x + rect.width &&
                this.x + this.width > rect.x &&
                this.y < rect.y + rect.height &&
                this.y + this.height > rect.y);
        }
    }
    Rectangle.prototype.fill = function (ctx) {
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    Rectangle.prototype.drawImageArea = function (ctx, img, sx, sy, sw, sh) {
        if (img.width)
            ctx.drawImage(img, sx, sy, sw, sh, this.x, this.y, this.width, this.height);
        else
            ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    function Message(string, x, y) {
        this.string = (string == null) ? '?' : string;
        this.x = (x == null) ? 0 : x;
        this.y = (y == null) ? 0 : y;
    }
    document.addEventListener('keydown', function (evt) {
        lastPress = evt.keyCode;
        pressing[evt.keyCode] = true;
    }, false);
    document.addEventListener('keyup', function (evt) {
        pressing[evt.keyCode] = false;
    }, false);
    function repaint() {
        window.requestAnimationFrame(repaint);
        paint(ctx);
    }
    function run() {
        setTimeout(run, 50);
        act(0.05);
    }
    function init() {
        // Get canvas and context
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
        // Start game
        run();
        repaint();
    }
    window.addEventListener('load', init, false);
})();
