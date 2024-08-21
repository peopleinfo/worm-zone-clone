function formatDataForSave(drawing) {
    const lines = drawing.lines.map(line => {
        return line.map(p => [p.x, p.y]);
    });

    return { lines };
}

function formatDataForLoad(drawing) {
    const lines = drawing.lines.map(line => {
        return line.map(p => ({ x: p[0], y: p[1] }));
    });

    return { lines };
}

function isCollided(circle1, circle2) {
    // let eps = 2;

    // if (
    //     circle1.x + circle1.radius - eps > circle2.x - circle2.radius &&
    //     circle1.y + circle1.radius - eps > circle2.y - circle2.radius &&
    //     circle1.x - circle1.radius + eps < circle2.x + circle2.radius &&
    //     circle1.y - circle1.radius + eps < circle2.y + circle2.radius
    // ) {
    //     return true;
    // }

    const distance = Math.hypot(circle1.x - circle2.x, circle1.y - circle2.y);
    return distance < circle1.radius + circle2.radius;
}


function getRandomColor() {
    const colors = ['red', 'green', 'blue', 'white', 'yellow', 'orange', 'purple', 'lightgreen', 'grey'];
    const randInd = Math.floor(Math.random() * colors.length);
    return colors[randInd];
}


function lerp(a, b, t) {
    return a + (b - a) * t;
}

const getRandX = () => Math.random() * canvas.width;
const getRandY = () => Math.random() * canvas.height;