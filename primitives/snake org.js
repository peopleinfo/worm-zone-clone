class Snake {
    static deadPoints = [];

    static drawDeadpoints(ctx) {
        // Snake.deadPoints.forEach(p => p.draw(ctx));

        for (let i = 0; i < Snake.deadPoints.length; i += 2) {
            Snake.deadPoints[i].draw(ctx);
        }
    }

    constructor(x = 0, y = 0, length = 20, color = "red") {
        this.radius = 4;
        this.speed = 0.7;
        this.points = [new Point(x, y, this.radius, getRandomColor())];
        this.velocity = { x: 1, y: 0 };
        this.overPos = { x: 0, y: 0 };
        this.color = getRandomColor();
        this.fatScaler = 0.001;

        for (let i = 1; i < length; i++) {
            this.points.push(new Point(INFINITY, INFINITY, this.radius, getRandomColor()));
        }
    }

    moveLeft() {
        if (!this.velocity.x) this.velocity = { x: -1, y: 0 };
    }
    moveRight() {
        if (!this.velocity.x) this.velocity = { x: 1, y: 0 };
    }
    moveUp() {
        if (!this.velocity.y) this.velocity = { x: 0, y: -1 };
    }
    moveDown() {
        if (!this.velocity.y) this.velocity = { x: 0, y: 1 };
    }

    moveRand() {
        const actions = [
            this.moveUp,
            this.moveDown,
            this.moveLeft,
            this.moveRight,
        ];
        const ind = Math.floor(Math.random() * 4);
        actions[ind].bind(this)();
    }

    eat(color = 'red') {
        const newPoint = new Point(INFINITY, INFINITY, this.radius, color);
        this.points.push(newPoint);

        this.radius = Math.min(10, Math.max(4, this.points.length * this.fatScaler));   // cap to 10
    }

    getHead() {
        return this.points[0] ?? this.overPos;
    }

    move() {
        const headX = (this.getHead().x + 2 * this.speed * this.velocity.x);
        const headY = (this.getHead().y + 2 * this.speed * this.velocity.y);

        const head = new Point(headX, headY, this.getHead().radius, this.getHead().color);

        this.points.unshift(head);
        this.points.pop();
    }

    cutIfCollidedWithSelf() {       // TODO: fix this logic
        const cutPointIndex = this.getIndexIfCollidedWithSelf(this.points);
        if (cutPointIndex == -1) return;

        const cutPoints = this.points.filter((p, i) => {
            return this.points.indexOf(p) >= cutPointIndex;
        });

        const latestDeadPoints = cutPoints.map(p => new Point(p.x, p.y, p.radius, getRandomColor()));
        Snake.deadPoints.push(...latestDeadPoints);

        this.points.length = cutPointIndex;
    }

    getIndexIfCollidedWithSelf(points) {
        return points.findIndex(point => {
            if (point == this.getHead()) return false;

            // if (isCollided(this.getHead(), point)) return point;     // TODO: fix this logic
        });
    }

    checkCollisionsWithFood(point) {            // this to food || this to deadpoints collisions
        const head = this.getHead();
        // if (point == head) return;
        if (isCollided(head, point)) {
            this.eat(point.color);
            return point;
        }
    }

    checkCollisionsWidthOtherSnakes(snake) {
        if (snake == this) return;

        const head = this.getHead();

        const collided = snake.points.find(p => isCollided(head, p) && p);
        if (collided) this.over();
    }

    checkCollisionsWithBoundary() {
        const head = this.getHead();

        if (
            head.x < 0 ||
            head.y < 0 ||
            head.x + head.radius > canvas.width ||
            head.y + head.radius > canvas.height
        ) {
            this.over();
        }
    }

    over() {
        const latestDeadPoints = this.points.map(p => new Point(p.x, p.y, defRad, getRandomColor()));
        Snake.deadPoints.push(...latestDeadPoints);

        const head = this.getHead();
        this.overPos.x = head.x;
        this.overPos.y = head.y;
        this.points.length = 0;
    }

    draw(ctx) {
        // this.points.forEach(p => p.draw(ctx, '', this.radius));

        for (let i = 0; i < this.points.length; i += Math.floor(this.radius)) {
            this.points[i].draw(ctx, '', this.radius);
        }

        if (!this.points.length) return;
        this.drawEye(ctx);
        this.drawEar(ctx);
        this.drawMouth(ctx);
    }

    drawEye(ctx) {
        const head = this.getHead();
        const eyeGapCoeff = 2;

        const eyeRight = new Point(
            head.x - this.radius / eyeGapCoeff * this.velocity.y,
            head.y + this.radius / eyeGapCoeff * this.velocity.x,
            this.radius / 4,
        );

        const eyeLeft = new Point(
            head.x + this.radius / eyeGapCoeff * this.velocity.y,
            head.y - this.radius / eyeGapCoeff * this.velocity.x,
            this.radius / 4,
        );

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(eyeRight.x, eyeRight.y, eyeRight.radius, 0, 2 * Math.PI);
        ctx.arc(eyeLeft.x, eyeLeft.y, eyeLeft.radius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(eyeRight.x, eyeRight.y, eyeRight.radius / 2, 0, 2 * Math.PI);
        ctx.arc(eyeLeft.x, eyeLeft.y, eyeLeft.radius / 2, 0, 2 * Math.PI);
        ctx.fill();
    }

    drawEar(ctx) {
        const head = this.getHead();

        const earRight = new Point(
            head.x - this.radius * this.velocity.y,
            head.y + this.radius * this.velocity.x,
            this.radius / 3.5,
        );

        const earLeft = new Point(
            head.x + this.radius * this.velocity.y,
            head.y - this.radius * this.velocity.x,
            this.radius / 3.5,
        );

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(earLeft.x, earLeft.y, earLeft.radius, 0, 2 * Math.PI);
        ctx.arc(earRight.x, earRight.y, earRight.radius, 0, 2 * Math.PI);
        ctx.fill();
    }

    drawMouth(ctx) {
        const head = this.getHead();

        const mouth = new Point(
            head.x + this.radius / 2 * this.velocity.x,
            head.y + this.radius / 2 * this.velocity.y,
            this.radius / 8,
        );

        ctx.fillStyle = "red";
        ctx.beginPath();
        const angle = this.velocity.x ? 0 : Math.PI / 2;
        const max = this.radius / 2;
        const min = this.radius / 8;
        ctx.ellipse(mouth.x, mouth.y, min, max, angle, 0, Math.PI * 2);
        ctx.fill();
    }

}

