class Point {
    constructor(x = 0, y = 0, radius = 1, color = 'blue') {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw(ctx, color) {
        ctx.beginPath();
        ctx.fillStyle = color || this.color;
        ctx.moveTo(this.x, this.y);
        // ctx.lineWidth = 1;
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}