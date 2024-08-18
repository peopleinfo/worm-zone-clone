class Drawing {
    constructor() {
        this.lines = [];
    }

    delete() {
        this.lines = [];
    }

    pushLine(line) {
        this.lines.push(line);
    }

    redraw(ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.lines.forEach(line => {
            this.drawLine(line, ctx);
        });
    }

    drawLine(line, ctx, color = 'white') {
        const lineStart = line[0];

        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(lineStart.x, lineStart.y);

        for (let i = 0; i < line.length; i++) {
            const point = line[i];
            ctx.lineTo(point.x, point.y);
        }

        ctx.stroke();
    }
}