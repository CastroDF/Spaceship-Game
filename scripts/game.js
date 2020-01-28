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
        player = new Rectangle(225, 650, 10, 10, 3),
        shots = [],
        damaged = 0;

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
        player.x = 225;
        player.y = 650;
        player.health = 3;
        player.timer = 0;
        shots.length = 0;
        enemies.length = 0;
        enemies.push(new Rectangle(10, 0, 10, 10, 2));
        gameover = false;
    }
    function paint(ctx) {
        // Clean canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw body
        ctx.fillStyle = '#0f0';
        if (player.timer % 2 == 0)
            player.fill(ctx);
        // Draw shots
        ctx.fillStyle = '#f00';
        for (var i = 0, l = shots.length; i < l; i++)
            shots[i].fill(ctx);
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
        ctx.fillStyle = '#00f';
        for (var i = 0, l = enemies.length; i < l; i++) {
            if (enemies[i].timer % 2 == 0)
                ctx.fillStyle = '#00f';
            else
                ctx.fillStyle = '#fff';
            enemies[i].fill(ctx);
        }
        // Draw score
        ctx.fillStyle = '#fff';
        ctx.fillText('Score: ' + score, 0, 20);
        // Draw remaining health
        ctx.fillText('Health: ' + player.health, 210, 20);
    }

    function act() {
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
                shots.push(new Rectangle(player.x + 3, player.y, 7, 7));
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
                            enemies[i].x = random(canvas.width / 10) * 10;
                            enemies[i].y = 0;
                            enemies[i].health = 2;
                            enemies.push(new Rectangle(random(canvas.width / 10) * 10, 0, 10, 10, 2));
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
                            enemies.push(new Rectangle(random(canvas.width / 10) * 10, 0, 10, 10, 2));
                        }
                        else {
                            enemies[i].timer = 1;
                        }
                        shots.splice(j--, 1);
                        ll--;
                    }
                }
            }
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
    function Rectangle(x, y, width, height, health) {
        this.x = (x == null) ? 0 : x;
        this.y = (y == null) ? 0 : y;
        this.width = (width == null) ? 0 : width;
        this.height = (height == null) ? this.width : height;
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
        act();
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
