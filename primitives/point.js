class Point {
    constructor(x = 0, y = 0, radius = 1) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    draw(ctx, color = 'grey') {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}