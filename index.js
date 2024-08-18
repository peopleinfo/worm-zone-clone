/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("app");

/**
 * @type {CanvasRenderingContext2D}
 */

const ctx = canvas.getContext("2d");

canvas.width = '475';
canvas.height = '300';



class Point {
    constructor(x = 0, y = 0, radius = 1) {
        this.x = x;
        this.y = y;
        this.thickness = radius;
    }

    draw(color = 'red') {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, this.thickness, 0, 2 * Math.PI);
        ctx.fill();
    }
}


class Circle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    getPos(alphaDegrees) {
        const alphaRadians = alphaDegrees * (Math.PI / 180);

        const cx = Math.cos(alphaRadians) * this.radius;
        const cy = Math.sin(alphaRadians) * this.radius;

        return [this.x + cx, this.y + cy];
    }

    draw() {
        for (let i = 0; i <= 360; i++) {
            new Point(
                ...this.getPos(i)
            ).draw();

        }
    }
}

// new Circle(canvas.width / 2, canvas.height / 2, 50).draw();


class Drawing {
    constructor() {
        this.points = [];
    }

    remove(){
        this.points = [];
    }

    pushPoint(point) {
        this.points.push(point);
    }

    redraw(){
        ctx.clearRect(0,0, canvas.width, canvas.height);
        this.points.forEach(point => point.draw());
    }
}


const drawing = new Drawing();

let isDrawing = false;

canvas.onmousedown = () => isDrawing = true;
canvas.onmouseup = () => isDrawing = false;

refreshBtn.onclick = () => drawing.redraw();



canvas.onmousemove = function (e) {
    if (isDrawing) {
        const p = new Point(e.offsetX, e.offsetY);
        p.draw();
        drawing.pushPoint(p);
    }
};

saveBtn.onclick = () => {
    const pointsStr = JSON.stringify(drawing.points);
    localStorage.setItem("points", pointsStr);
    drawing.redraw();
};

loadBtn.onclick = () => {
    const points = JSON.parse(localStorage.getItem("points")) ?? [];

    drawing.remove();

    points.forEach(point => {
        drawing.pushPoint(new Point(point.x, point.y, point.i, point.radius))
    });

    drawing.redraw()
}

deleteBtn.onclick = () => {
    drawing.remove()
    drawing.redraw()
}