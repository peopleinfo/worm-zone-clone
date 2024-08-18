let i = 0;

class Food {
    constructor(radius = 10) {
        this.x = getRandX();
        this.y = getRandY();
        this.radius = radius;
        this.color = getRandomColor();
    }

    regenerate() {
        this.x = getRandX();
        this.y = getRandY();
        this.color = getRandomColor();
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        // ctx.moveTo(this.x, this.y);
        // ctx.lineWidth = 1
        this.radius = lerp(this.radius * 0.8, this.radius, ++i / this.radius);
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        i %= 17;
    }
}