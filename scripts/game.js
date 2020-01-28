(function () {
    'use strict';
    window.addEventListener('load', init, false);
    var canvas = null,
        ctx = null,
        x = 50,
        y = 50,
        lastPress = null,
        pause = true,
        pressing = [],
        KEY_LEFT = 37,
        KEY_UP = 38,
        KEY_RIGHT = 39,
        KEY_DOWN = 40,
        KEY_ENTER = 13;

    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 17);
            };
    }());

    document.addEventListener('keydown', function (evt) {
        lastPress = evt.which;
    }, false);

    function paint(ctx) {
        // Clean canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw body
        ctx.fillStyle = '#0f0';
        ctx.fillRect(x, y, 10, 10);
        // Debug last key pressed
        ctx.fillStyle = '#fff';
        // Draw pause
        if (pause) {
            ctx.textAlign = 'center';
            ctx.fillText('PAUSE', 225, 350);
            ctx.textAlign = 'left';
        }
    }

    function act() {
        if (!pause) {
            // Move Rect
            if (pressing[KEY_UP])
                y -= 10;
            if (pressing[KEY_RIGHT])
                x += 10;
            if (pressing[KEY_DOWN])
                y += 10;
            if (pressing[KEY_LEFT])
                x -= 10;
            // Out Screen
            if (x > canvas.width)
                x = 0;
            if (y > canvas.height)
                y = 0;
            if (x < 0)
                x = canvas.width;
            if (y < 0)
                y = canvas.height;
        }
        // Pause/Unpause
        if (lastPress == KEY_ENTER) {
            pause = !pause;
            lastPress = null;
        }
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
