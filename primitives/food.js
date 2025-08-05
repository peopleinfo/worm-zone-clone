
class Food {
    static i = 0;
    constructor(radius = defRad) {
        this.x = getRandX();
        this.y = getRandY();
        this.radius = radius;
        this.color = getRandomColor();
        this.id = Math.random().toString(36).substr(2, 9); // Generate unique ID
    }

    regenerate() {
        this.x = getRandX();
        this.y = getRandY();
        this.color = getRandomColor();
    }

    animate(){
        this.radius = lerp(this.radius * 0.8, this.radius, ++Food.i / this.radius);
        Food.i %= 17;        
    }

    draw(ctx, color) {
        // this.animate();
        ctx.beginPath();
        ctx.fillStyle = color || this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}