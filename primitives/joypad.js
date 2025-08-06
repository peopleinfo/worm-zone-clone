class Joypad {
    constructor(radius = 50) {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.inner = { x: 0, y: 0, radius: radius };
        this.outer = { x: 0, y: 0, radius: this.inner.radius * 1.3 };
        this.skipDrawing = true;
        this.player = {};
        window.addEventListener("mousedown", this.handleMouseDown.bind(this));
        window.addEventListener("touchstart", this.handleTouchDown.bind(this));

        window.addEventListener("mousemove", this.handleMouseMove.bind(this));
        window.addEventListener("touchmove", this.handleTouchMove.bind(this));

        window.addEventListener("mouseup", this.handleUp.bind(this));
        window.addEventListener("touchend", this.handleUp.bind(this));
    }

    connectWith(player) {
        this.player = player;
    }

    draw() {
        if (this.skipDrawing) return;

        ctx.beginPath();
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 0.5;
        ctx.arc(this.outer.x, this.outer.y, this.outer.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.arc(this.inner.x, this.inner.y, this.inner.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    centerInner() {
        this.inner.x = this.outer.x;
        this.inner.y = this.outer.y;
    }

    handleDown() {
        this.skipDrawing = false;
        this.centerInner();
    }

    handleMouseDown(e) {
        this.outer.x = e.offsetX;
        this.outer.y = e.offsetY;
        this.handleDown();
    }

    handleTouchDown(e) {
        const { screenX, screenY } = e.touches[0];
        this.outer.x = screenX;
        this.outer.y = screenY;
        this.handleDown();
    }

    handleUp() {
        this.skipDrawing = true;
    }

    handleMouseMove(e) {
        if (this.skipDrawing) return;
        if (typeof isGamePaused !== 'undefined' && isGamePaused) return; // Prevent input when game is paused

        const dX = e.offsetX - this.outer.x;
        const dY = e.offsetY - this.outer.y;

        const distance = Math.sqrt(dX * dX + dY * dY);

        if (distance > this.outer.radius) {
            const angle = Math.atan2(dY, dX);
            this.inner.x = this.outer.x + Math.cos(angle) * this.outer.radius;
            this.inner.y = this.outer.y + Math.sin(angle) * this.outer.radius;
        } else {
            this.inner.x = e.offsetX;
            this.inner.y = e.offsetY;
        }

        const angle = Math.atan2(this.outer.x - this.inner.x, this.outer.y - this.inner.y) * coeffR2D;
        this.player.updateAngle(angle + 90);
    }

    handleTouchMove(e) {
        if (this.skipDrawing) return;
        if (typeof isGamePaused !== 'undefined' && isGamePaused) return; // Prevent input when game is paused
        const { screenX, screenY } = e.touches[0];

        const dX = screenX - this.outer.x;
        const dY = screenY - this.outer.y;

        const distance = Math.sqrt(dX * dX + dY * dY);

        if (distance > this.outer.radius) {
            const angle = Math.atan2(dY, dX);
            this.inner.x = this.outer.x + Math.cos(angle) * this.outer.radius;
            this.inner.y = this.outer.y + Math.sin(angle) * this.outer.radius;
        } else {
            this.inner.x = screenX;
            this.inner.y = screenY;
        }

        const angle = Math.atan2(this.outer.x - this.inner.x, this.outer.y - this.inner.y) * coeffR2D;
        this.player.updateAngle(angle + 90);
    }
}