function rect(x, y, w, h, alpha){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.alpha = alpha;
    this.vertex = [];
    this.vertex.push([x, y]);
    this.vertex.push([x + w * Math.cos(alpha), y + w * Math.sin(alpha)]);
    this.vertex.push([x + w * Math.cos(alpha) - h * Math.sin(alpha), y + w * Math.sin(alpha) + h * Math.cos(alpha)]);
    this.vertex.push([x - h * Math.sin(alpha), y + h * Math.cos(alpha)]);
    this.edge = [];
    this.edge.push([this.vertex[1][0] - this.vertex[0][0], this.vertex[1][1] - this.vertex[0][1]]);
    this.edge.push([this.vertex[2][0] - this.vertex[1][0], this.vertex[2][1] - this.vertex[1][1]]);
    this.xMax = Math.max(this.vertex.map(v => v[0]));
    this.xMin = Math.min(this.vertex.map(v => v[0]));
    this.yMax = Math.max(this.vertex.map(v => v[1]));
    this.yMin = Math.min(this.vertex.map(v => v[1]));
    this.setColor = function(color){
        this.color = color;
    }
    this.stroke = function(){
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(this.vertex[0][0], this.vertex[0][1], 2, 2);
        ctx.strokeRect(this.vertex[3][0], this.vertex[3][1], 2, 2);
        ctx.strokeRect(this.vertex[1][0], this.vertex[1][1], 2, 2);
        ctx.strokeRect(this.vertex[2][0], this.vertex[2][1], 2, 2);
        ctx.restore();
    };
    this.draw = function(){
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.alpha);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, this.w, this.h);
        ctx.restore();
        //console.log(this.vertex);
    };
};

function rectCollision(rect1, rect2){
    if(rect1.xMax < rect2.xMin || rect1.xMin > rect2.xMax || rect1.yMax < rect2.yMin || rect1.yMin > rect2.yMax){
        return false;
    }else{
        return rectNarrowCollision(rect1, rect2);
    }
}

function rectContain(rect1, rect2){
    var xMin = Infinity;
    var xMax = -Infinity;
    var yMin = Infinity;
    var yMax = -Infinity;
    const x2Normalized = [Math.cos(rect2.alpha), Math.sin(rect2.alpha)];
    const x2Projection = dot([rect2.x, rect2.y], x2Normalized);
    const y2Normalized = [-Math.sin(rect2.alpha), Math.cos(rect2.alpha)];
    const y2Projection = dot([rect2.x, rect2.y], y2Normalized);
    return rect1.vertex.every(vertex => {
        var x = dot(vertex, x2Normalized) - x2Projection;
        var y = dot(vertex, y2Normalized) - y2Projection;
        return (x >= 0 && x <= rect2.w && y >= 0 && y <= rect2.h);
    });
}

function rectNarrowCollision(rect1, rect2){
    edgeNormal1 = [normal(rect1.edge[0]), normal(rect1.edge[1])];
    edgeNormal2 = [normal(rect2.edge[0]), normal(rect2.edge[1])];
    free1 = edgeNormal1.some(n => {
        let r1min = Infinity;
        let r1max = -Infinity;
        rect1.vertex.forEach(v => {
            r1min = Math.min(dot(v, n), r1min);
            r1max = Math.max(dot(v, n), r1max);
        });
        let r2min = Infinity;
        let r2max = -Infinity;
        rect2.vertex.forEach(v => {
            r2min = Math.min(dot(v, n), r2min);
            r2max = Math.max(dot(v, n), r2max);
        });
        if(r1min > r2max || r1max < r2min){
            return true;
        }else{
            return false;
        }
    });
    free2 = edgeNormal2.some(n => {
        let r1min = Infinity;
        let r1max = -Infinity;
        rect1.vertex.forEach(v => {
            r1min = Math.min(dot(v, n), r1min);
            r1max = Math.max(dot(v, n), r1max);
        });
        let r2min = Infinity;
        let r2max = -Infinity;
        rect2.vertex.forEach(v => {
            r2min = Math.min(dot(v, n), r2min);
            r2max = Math.max(dot(v, n), r2max);
        });
        if(r1min > r2max || r1max < r2min){
            return true;
        }else{
            return false;
        }
    });
    return !(free1 || free2);
}

var obsList = [];
function makeObs(x, y, w, h, alpha){
    obsList.push(new rect(x, y, w, h, alpha));
}

function drawObs(){
    obsList.forEach(obs => {
        obs.draw();
        //obs.stroke();
    })
}

function obsCollision(){
    obsList.forEach(obs => {
        if(rectNarrowCollision(obs, myCar.rect)){
            obs.setColor('red');
        }else{
            obs.setColor('black');
        }
    });
}

makeObs(200, 200, 32, 80, 0);
makeObs(300, 200, 32, 80, 0);
target = new rect(240, 190, 52, 100, 0);

function inTarget(){
    if(rectContain(myCar.rect, target)){
        target.color = 'green';
    }else{
        target.color = 'white';
    }
}

keyListSteer = ['q', 'e', 'a', 'd', 'z', 'c', 'ArrowLeft', 'ArrowRight'];
keyListPedalNGear = ['ArrowUp', 'ArrowDown'];
keyList = keyListSteer.concat(keyListPedalNGear);
keys = [];
while(keys.length < keyList.length)
    keys.push(0);
actions = [];
counter = 0;
interval = 40;
fps = 1000 / interval;

var myCar = new car();
var ctx = document.getElementById('canv').getContext('2d');
myCar.setPos(100, 100, Math.PI * 3 / 2, 0);
myCar.draw();

window.addEventListener('keydown', 
function (e) {
    if(keyList.includes(e.key) && keys[keyList.indexOf(e.key)] == 0){
        keys[keyList.indexOf(e.key)] = 1;
    }
})

window.addEventListener('keyup',
function (e) {
    if(keyList.includes(e.key)){
        if(keys[keyList.indexOf(e.key)] == 1) {
            actions.push([e.key, 1]);
        }
        keys[keyList.indexOf(e.key)] = 0;
        actions.push([e.key, 0]);
    }
})

window.setInterval(update, interval);

function wheel(x, y, steer = true){
    this.x = x;
    this.y = y;
    this.steer = steer;
    this.beta = 0;
    this.IRR = 0;
}

function car(length = 80, width = 36, frontWheelPos = 16, rearWheelPos = 64, frontTrack = 30, rearTrack = 30, maxSteer = Math.PI / 5, wheelRadius = 5, color = '#00DFDF'){
    this.length = length;
    this.width = width;
    this.frontWheelPos = frontWheelPos;
    this.rearWheelPos = rearWheelPos;
    this.xFrontWheel = frontTrack / 2;
    this.xRearWheel = rearTrack / 2;
    this.yFrontWheel = length / 2 - frontWheelPos;
    this.yRearWheel = length / 2 - rearWheelPos;
    this.wheelBase = rearWheelPos - frontWheelPos;
    this.frontTrack = frontTrack;
    this.rearTrack = rearTrack;
    this.wheelRadius = wheelRadius;
    this.maxSteer = maxSteer;
    this.color = color;
    this.x = 0;
    this.y = 0;
    this.theta = 0;
    this.targetSteer = 0;
    this.currentSteer = 0;
    this.gear = 'D';
    this.gearState = 0;
    this.speed = 0;
    this.IRR = 0;
    this.wheels = 
    [new wheel(-this.xFrontWheel, this.yFrontWheel, true), 
    new wheel(this.xFrontWheel, this.yFrontWheel, true),
    new wheel(-this.xRearWheel, this.yRearWheel, false), 
    new wheel(this.xRearWheel, this.yRearWheel, false)];
    this.setPos = function(x, y, theta, beta) {
        this.x = x;
        this.y = y;
        this.theta = theta;
        this.beta = beta;
        this.setRect();
    };
    this.move = function(){
        let speed;
        if(this.gear == 'D'){
            speed = this.speed / 5;
        }else{
            speed = -this.speed / 5;
        }
        if(this.IRR == 0) {
            this.x += -speed * Math.sin(this.theta);
            this.y += speed * Math.cos(this.theta);
        } else {
            if(speed != 0) {
                dTheta = speed / -this.IRR;
                this.theta += dTheta;
                this.thetaG += dTheta;
                this.x = this.ICRG[0] - this.IRR * Math.cos(this.thetaG);
                this.y = this.ICRG[1] - this.IRR * Math.sin(this.thetaG);
            }
        }
        if(speed != 0){
            this.setRect();
        }
    };
    this.setSteer = function(steerChange) {
        this.targetSteer += Math.round(steerChange);
        this.targetSteer = Math.max(-36, Math.min(36, this.targetSteer));
    };
    this.steer = function() {
        if (this.currentSteer > this.targetSteer) {
            this.currentSteer -= 1;
        } else if (this.currentSteer < this.targetSteer) {
            this.currentSteer += 1;
        } else {
            return;
        }
        if(this.currentSteer){
            this.ICRL = this.wheelBase / Math.tan(this.currentSteer * this.maxSteer / 36);
            this.ICRG = [
                this.x + this.ICRL * Math.cos(this.theta) - this.yRearWheel * Math.sin(this.theta),
                this.y + this.ICRL * Math.sin(this.theta) + this.yRearWheel * Math.cos(this.theta)
            ];
            this.IRR = Math.sign(this.ICRL) * Math.sqrt(this.ICRL ** 2 + this.yRearWheel ** 2);
            this.thetaG = this.theta + Math.atan(this.yRearWheel / this.ICRL);
            //console.log(this.theta, this.thetaG);
        } else {
            this.ICRL = 0;
            this.IRR = 0;
        }
        this.wheels.forEach(wheel => {
            if(this.ICRL){
                if(wheel.steer){
                    wheel.beta = -Math.atan(this.wheelBase / (this.ICRL - wheel.x));
                }
                wheel.IRR = Math.sign(this.ICRL) * Math.sqrt((this.ICRL - wheel.x) ** 2 + (this.yRearWheel - wheel.y) ** 2);
            } else {
                wheel.beta = 0;
                wheel.IRR = 0;
            }
        });
        //console.log(this.currentSteer, this.ICRL);
    };
    this.pedalNGear = function(key, frame){
        if(this.gearState == -1){
            if(frame == 0 && ((this.gear == 'D' && key == 'ArrowUp') || (this.gear == 'R' && key == 'ArrowDown'))){
                this.gearState = 0;
            }
            return;
        }else{
            let aKey, bKey, speedLim;
            if(this.gear == 'D'){
                aKey = 'ArrowUp';
                bKey = 'ArrowDown';
                speedLim = 25;
            }else{
                aKey = 'ArrowDown';
                bKey = 'ArrowUp';
                speedLim = 10;
            }
            if(key == aKey && frame != 0){
                this.speed = Math.min(speedLim, this.speed + 1);
                this.gearState = 1;
                return;
            }else if(key == bKey && frame != 0){
                if(this.speed > 0){
                    this.speed = Math.max(0, this.speed - 3);
                }else if(this.speed == 0 && frame == 1){
                    if(this.gear == 'D'){
                        this.gear = 'R';
                    }else{
                        this.gear = 'D';
                    }
                    this.gearState = -1;
                }
            }else if(key == bKey && frame == 0 && this.speed == 0 && this.gearState == 1){
                this.gearState == 0;
                return;
            }
        }
    }
    this.setRect = function(){
        this.rect = new rect(this.x + Math.sin(this.theta) * this.length / 2 - Math.cos(this.theta) * this.width / 2, 
        this.y  - Math.cos(this.theta) * this.length / 2 - Math.sin(this.theta) * this.width / 2, 
        this.width, this.length, this.theta);
    };
    this.draw = function(){
        ctx.save();
        ctx.fillStyle = color;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.theta);
        ctx.globalAlpha = 0.5;
        ctx.fillRect(-this.width/2, -this.length/2, this.width, this.length);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#000';
        //ctx.fillText(Math.round(this.IRR), 0, 0);
        var gradient = ctx.createRadialGradient(0,
            0, 
            myCar.length / 3, 
            0, 
            0,
            myCar.length * 1.1);
        gradient.addColorStop(0, 'rgba(0, 255, 200, 1)');
        gradient.addColorStop(1, 'rgba(0, 255, 200, 0)');
        this.wheels.forEach(wheel => {
            if((wheel.steer && this.gear == 'D') || (!wheel.steer && this.gear == 'R')){
                ctx.save();
                ctx.lineWidth = 3;
                //ctx.fillStyle = gradient;
                ctx.strokeStyle = gradient;
                let l = Math.min(Math.PI / 2, this.length / wheel.IRR);
                if(this.currentSteer == 0){
                    if(this.gear == 'D'){
                        ctx.beginPath();
                        ctx.moveTo(wheel.x, wheel.y);
                        ctx.lineTo(wheel.x, wheel.y + this.length);
                        ctx.stroke();
                    }else{
                        ctx.beginPath();
                        ctx.moveTo(wheel.x, wheel.y);
                        ctx.lineTo(wheel.x, wheel.y - this.length);
                        ctx.stroke();
                    }
                }else{
                    ctx.beginPath();
                    let r, sAngle, eAngle, c;
                    if(wheel.IRR < 0){
                        r = -wheel.IRR;
                        sAngle = wheel.beta;
                        eAngle = wheel.beta - l;
                        c = false;
                    }else{
                        r = wheel.IRR;
                        sAngle = Math.PI + wheel.beta;
                        eAngle = Math.PI + wheel.beta - l;
                        c = true;
                    }
                    if(this.gear == 'R'){
                        sAngle += l;
                        eAngle += l;
                    }
                    ctx.arc(this.ICRL, this.yRearWheel, r, sAngle, eAngle, c);
                    ctx.stroke();
                }
                ctx.restore();
            }
            if(wheel.steer && wheel.beta){
                ctx.save();
                ctx.translate(wheel.x, wheel.y);
                ctx.rotate(wheel.beta);
                ctx.fillRect(-2, -this.wheelRadius, 4, 10);
                //ctx.fillText(Math.round(wheel.IRR), 0, 0);
                ctx.restore();
            } else {
                ctx.fillRect(wheel.x - 2, wheel.y - this.wheelRadius, 4, 10);
                //ctx.fillText(Math.round(wheel.IRR), wheel.x, wheel.y);
            }
        });
        ctx.restore();
        this.rect.draw();
        //ctx.fillRect(this.x + this.ICRL * Math.cos(this.theta) - 1, this.y + this.ICR * Math.sin(this.theta) - 1, 2, 2);
    };
    this.drawStats = function () {
        ctx.strokeText('Speed: ' + this.speed, 10, 20);
        ctx.strokeText('Steer: ' + this.currentSteer, 10, 50);
        ctx.strokeText('- ' + this.gear + ' -', 10, 35);
    };
};

var longPressTime = Math.round(fps / 2);

function update(){
    //console.log(myCar.x, myCar.y, myCar.theta);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    keys.forEach(function(downTime, index){
        if(downTime > 0) {
            if(downTime < longPressTime) {
                keys[index] += 1;
            }
            if(keys[index] > 1) {
                actions.push([keyList[index], downTime]);
            }
        }
    });
    while(actions.length){
        var a = actions.shift();
        //console.log(a);
        if(keyListSteer.includes(a[0])) {
            if(a[1] == 1) {
                if(a[0] == 'q')
                    myCar.setSteer(36);
                else if(a[0] == 'e')
                    myCar.setSteer(-36);
                else if(a[0] == 'a' || a[0] == 'ArrowLeft')
                    myCar.setSteer(6);
                else if(a[0] == 'd' || a[0] == 'ArrowRight')
                    myCar.setSteer(-6);
                else if(a[0] == 'z')
                    myCar.setSteer(1);
                else if(a[0] == 'c')
                    myCar.setSteer(-1);
            }
        }else if(keyListPedalNGear.includes(a[0])){
            myCar.pedalNGear(a[0], a[1]);
        }
    }
    ctx.canvas.width = window.innerWidth - 2;
    ctx.canvas.height = window.innerHeight - 1;
    myCar.steer();
    myCar.move();
    ctx.save();
    ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
    ctx.rotate(-myCar.theta + Math.PI);
    ctx.translate(-myCar.x, -myCar.y);
    inTarget();
    target.draw();
    myCar.draw();
    obsCollision();
    drawObs();
    ctx.restore();
    myCar.drawStats();
}

