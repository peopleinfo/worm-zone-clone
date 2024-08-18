class Point {
    constructor(x = 0, y = 0, radius = defRad, color = 'blue') {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw(ctx, color, radius) {
        ctx.beginPath();
        ctx.fillStyle = color || this.color;
        ctx.arc(this.x, this.y, radius ||this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}