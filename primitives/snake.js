class Snake {
    static deadPoints = [];

    constructor(x = 0, y = 0, length = 5, color = "red") {
        this.radius = 8;
        this.speed = 0.1;
        this.points = [new Point(x, y, this.radius, getRandomColor())];
        this.velocity = { x: 1, y: 0 };
        this.eyeColor = getRandomColor();

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
    }

    getHead() {
        return this.points[0] ?? {};
    }

    move() {
        const headX = (this.getHead().x + 2 * this.radius * this.velocity.x);
        const headY = (this.getHead().y + 2 * this.radius * this.velocity.y);

        const head = new Point(
            headX,
            headY,
            this.getHead().radius,
            this.getHead().color
        );

        this.points.unshift(head);
        this.points.pop();

        this.speed = this.radius * 1.88;

        this.points.forEach((p, i) => {
            p.x -= this.speed * this.velocity.x;
            p.y -= this.speed * this.velocity.y;
        });
    }

    drawDynamically(ctx) {
        const head = this.getHead();
        const coeff = 1;
        ctx.translate(-this.velocity.x * coeff, -this.velocity.y * coeff);
        this.draw(ctx);
    }

    cutIfCollided() {
        const cutPointIndex = this.getIndexIfCollidedWith(this.points);
        if (cutPointIndex == -1) return;

        const cutPoints = this.points.filter((p, i) => {
            return this.points.indexOf(p) >= cutPointIndex;
        });

        const latestDeadPoints = cutPoints.map(p => new Point(p.x, p.y, p.radius, getRandomColor()));
        Snake.deadPoints.push(...latestDeadPoints);

        this.points.length = cutPointIndex;

        // setTimeout(() => Snake.deadPoints.length = 0, 10000);
    }

    getIndexIfCollidedWith(points) {
        return points.findIndex(point => {
            if (point == this.getHead()) return false;

            if (isCollided(this.getHead(), point)) return point;
        });
    }

    checkCollisions(point) {
        const head = this.getHead();
        if (point == head) return;

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

        if (
            head.x < -m ||
            head.y < -m ||
            head.x + head.radius > canvas.width - m ||
            head.y + head.radius > canvas.height - m
        ) {
            this.over();
        }
    }

    over() {
        const latestDeadPoints = this.points.map(p => new Point(p.x, p.y, p.radius, getRandomColor()));
        Snake.deadPoints.push(...latestDeadPoints);
        this.points.length = 0;
    }

    draw(ctx) {
        const deadPointsColor = Math.random() < 0.2 && 'grey';
        Snake.deadPoints.forEach(p => p.draw(ctx, deadPointsColor));
        this.points.forEach(p => p.draw(ctx));

        this.drawEye(ctx);
    }

    drawEye(ctx) {
        const head = this.getHead();

        ctx.beginPath();
        ctx.fillStyle = this.eyeColor;
        // ctx.moveTo(head.x, head.y);
        ctx.arc(head.x, head.y, head.radius / 2, 0, 2 * Math.PI);
        ctx.fill();
    }
}
