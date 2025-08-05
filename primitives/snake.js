class Snake {
    static deadPoints = [];

    static drawDeadpoints(ctx) {
        // Snake.deadPoints.forEach(p => p.draw(ctx));

        for (let i = 0; i < Snake.deadPoints.length; i += 2) {
            Snake.deadPoints[i].draw(ctx);
        }
    }

    constructor(x = 0, y = 0, length = 25, color = "red") {
        this.radius = 4;
        this.speed = 1.3;
        this.turningSpeed = 7;
        this.points = [new Point(x, y, this.radius, getRandomColor())];
        this.velocity = { x: 1, y: 0 };
        this.overPos = { x: 0, y: 0 };
        this.color = getRandomColor();
        this.fatScaler = 0.001;
        this.angle = 0;
        this.ai = true;

        for (let i = 1; i < length; i++) {
            this.points.push(new Point(INFINITY, INFINITY, this.radius, getRandomColor()));
        }
    }

    eat(color = 'red') {
        const newPoint = new Point(INFINITY, INFINITY, this.radius, color);
        this.points.push(newPoint);

        this.radius = Math.min(10, Math.max(4, this.points.length * this.fatScaler));   // cap to 10
    }

    getHead() {
        return this.points[0] ?? this.overPos;
    }

    calculateTargetAngleWithControls() {
        let targetAngle = this.angle;

        if (keys.up && keys.right) targetAngle = 45;
        else if (keys.up && keys.left) targetAngle = 90 + 45;
        else if (keys.down && keys.right) targetAngle = 270 + 45;
        else if (keys.down && keys.left) targetAngle = 270 - 45;
        else if (keys.up) targetAngle = 90;
        else if (keys.down) targetAngle = 270;
        else if (keys.left) targetAngle = 180;
        else if (keys.right) targetAngle = 0;

        return targetAngle;
    }

    calculateTargetAngleRandomly() {
        return [0, 45, 90, 135, 180, 225, 270, 315, 360][Math.floor(Math.random() * 8)];
    }

    move() {
        const targetAngle = this.ai ? this.calculateTargetAngleRandomly() : this.calculateTargetAngleWithControls();
        this.updateAngle(targetAngle);

        this.velocity = {
            x: Math.cos(this.angle * coeffD2R),
            y: Math.sin(this.angle * -coeffD2R)
        };

        const headX = (this.getHead().x + this.speed * this.velocity.x);
        const headY = (this.getHead().y + this.speed * this.velocity.y);

        const head = new Point(headX, headY, this.getHead().radius, this.getHead().color);

        this.points.unshift(head);
        this.points.pop();
    }

    updateAngle(targetAngle) {
        let deltaAngle = (targetAngle - this.angle) % 360;
        if (deltaAngle > 180) deltaAngle -= 360;
        if (deltaAngle < -180) deltaAngle += 360;

        if (deltaAngle > 0) {
            this.angle = (this.angle + Math.min(this.turningSpeed, deltaAngle)) % 360;
        } else if (deltaAngle < 0) {
            this.angle = (this.angle - Math.min(this.turningSpeed, -deltaAngle)) % 360;
        }

        if (this.angle < 0) this.angle += 360;
    }

    // cutIfCollidedWithSelf() {       // TODO: fix this logic
    //     const cutPointIndex = this.getIndexIfCollidedWithSelf(this.points);
    //     if (cutPointIndex == -1) return;

    //     const cutPoints = this.points.filter((p, i) => {
    //         return this.points.indexOf(p) >= cutPointIndex;
    //     });

    //     const latestDeadPoints = cutPoints.map(p => new Point(p.x, p.y, p.radius, getRandomColor()));
    //     Snake.deadPoints.push(...latestDeadPoints);

    //     this.points.length = cutPointIndex;
    // }

    // getIndexIfCollidedWithSelf(points) {
    //     return points.findIndex(point => {
    //         if (point == this.getHead()) return false;

    //         // if (isCollided(this.getHead(), point)) return point;     // TODO: fix this logic
    //     });
    // }

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
        
        // Show game over popup if this is the player's snake
        if (this === mySnake) {
            showGameOverPopup();
        }
        
        // Notify multiplayer client if this is the local player
        if (typeof multiplayerClient !== 'undefined' && multiplayerClient.isConnected && this === mySnake) {
            multiplayerClient.sendPlayerDeath(this);
        }
        
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
        const max = this.radius / 2;
        const min = this.radius / 8;
        ctx.ellipse(mouth.x, mouth.y, min, max, -this.angle * Math.PI / 180, 0, Math.PI * 2);
        ctx.fill();
    }

}

