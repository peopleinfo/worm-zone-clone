/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("app");

/**
 * @type {CanvasRenderingContext2D}
 */

const ctx = canvas.getContext("2d");

ctx.lineJoin = "round";
canvas.width = '1500';
canvas.height = '500';

const drawing = new Drawing();
let linePoints = [];

let isDrawing = false;

canvas.onmousedown = (e) => {
    isDrawing = true;
    startingPoint = { x: e.offsetX, y: e.offsetY };
    linePoints = [];
};

function handleMouseUpAndLeave() {
    if (isDrawing) {
        isDrawing = false;
        if (linePoints.length) drawing.pushLine(linePoints);
        linePoints = [];
        drawing.redraw(ctx);
    }
}

canvas.onmouseup = handleMouseUpAndLeave;
canvas.onmouseleave = handleMouseUpAndLeave;

canvas.onmousemove = function (e) {
    if (isDrawing) {
        const p = new Point(e.offsetX, e.offsetY);
        p.draw(ctx);
        linePoints.push(p);
    }
};


saveBtn.onclick = () => {
    const formattedDrawing = formatDataForSave(drawing);
    localStorage.setItem("drawing", JSON.stringify(formattedDrawing));
    drawing.redraw(ctx);       // remove this later
};

loadBtn.onclick = () => {
    const savedDrawing = JSON.parse(localStorage.getItem("drawing")) ?? [];
    drawing.delete();

    const formattedDrawing = formatDataForLoad(savedDrawing);

    formattedDrawing.lines.forEach(function (line) {
        drawing.pushLine(line);
    });

    drawing.redraw(ctx);
};

deleteBtn.onclick = () => {
    drawing.delete();
    drawing.redraw(ctx);
};

refreshBtn.onclick = () => drawing.redraw(ctx);