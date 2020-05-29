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
        cxt.save();
        cxt.strokeStyle = this.color;
        cxt.lineWidth = 1;
        cxt.strokeRect(this.vertex[0][0], this.vertex[0][1], 2, 2);
        cxt.strokeRect(this.vertex[3][0], this.vertex[3][1], 2, 2);
        cxt.strokeRect(this.vertex[1][0], this.vertex[1][1], 2, 2);
        cxt.strokeRect(this.vertex[2][0], this.vertex[2][1], 2, 2);
        cxt.restore();
    };
    this.draw = function(){
        cxt.save();
        cxt.translate(this.x, this.y);
        cxt.rotate(this.alpha);
        cxt.strokeStyle = this.color;
        cxt.lineWidth = 1;
        cxt.strokeRect(0, 0, this.w, this.h);
        cxt.restore();
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

var stillCar = new car();
stillCar.setPos(200, 200, 0, 0);

var myCar = new car();
var cxt = document.getElementById('canv').getContext('2d');
myCar.setPos(270, 250, 0, 0);
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

function car(length = 80, width = 36, frontWheelPos = 16, rearWheelPos = 64, frontTrack = 30, rearTrack = 30, maxSteer = Math.PI / 5, wheelRadius = 5, color = '#FF880F'){
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
    this.gearLock = false;
    this.pedalLock = false;
    this.arrowUp = 'u';
    this.ArrowDown = 'u';
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
    this.move = function() {
        if(this.IRR == 0) {
            this.x += -this.speed * Math.sin(this.theta);
            this.y += this.speed * Math.cos(this.theta);
        } else {
            if(this.speed != 0) {
                dTheta = this.speed / -this.IRR;
                this.theta += dTheta;
                this.thetaG += dTheta;
                this.x = this.ICRG[0] - this.IRR * Math.cos(this.thetaG);
                this.y = this.ICRG[1] - this.IRR * Math.sin(this.thetaG);
            }
        }
        if(this.speed != 0){
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
            console.log(this.theta, this.thetaG);
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
    this.pedalNGear = function(key){
        
    }
    this.setRect = function(){
        this.rect = new rect(this.x + Math.sin(this.theta) * this.length / 2 - Math.cos(this.theta) * this.width / 2, this.y  - Math.cos(this.theta) * this.length / 2 - Math.sin(this.theta) * this.width / 2, this.width, this.length, this.theta);
    };
    this.collision = function(obj2){
        
    };
    this.draw = function(){
        cxt.save();
        cxt.fillStyle = color;
        cxt.translate(this.x, this.y);
        //cxt.translate(250, 250);
        cxt.rotate(this.theta);
        cxt.globalAlpha = 0.5;
        cxt.fillRect(-this.width/2, -this.length/2, this.width, this.length);
        cxt.globalAlpha = 1;
        cxt.fillStyle = '#000';
        cxt.fillText(Math.round(this.IRR), 0, 0);
        cxt.fillRect(this.ICRL - 1, this.yRearWheel - 1, 2, 2);
        this.wheels.forEach(wheel => {
            if(wheel.steer && wheel.beta){
                cxt.save();
                cxt.translate(wheel.x, wheel.y);
                cxt.rotate(wheel.beta);
                cxt.fillRect(-2, -this.wheelRadius, 4, 10);
                //cxt.fillText(Math.round(wheel.IRR), 0, 0);
                cxt.restore();
            } else {
                cxt.fillRect(wheel.x - 2, wheel.y - this.wheelRadius, 4, 10);
                //cxt.fillText(Math.round(wheel.IRR), wheel.x, wheel.y);
            }
        });
        cxt.restore();
        this.rect.draw();
        //cxt.fillRect(this.x + this.ICRL * Math.cos(this.theta) - 1, this.y + this.ICR * Math.sin(this.theta) - 1, 2, 2);
    };
    this.drawStats = function () {
        cxt.strokeText(this.speed, 400, 400);
        cxt.strokeText(this.currentSteer, 400, 450);
    };
};

var longPressTime = Math.round(fps / 2);

function update(){
    //console.log(myCar.x, myCar.y, myCar.theta);
    cxt.clearRect(0, 0, 500, 500);
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
            if([1, longPressTime].includes(a[1])) {
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
        } else if(keyListPedalNGear.includes(a[0])) {
            if(a[1] == 0) {
                //myCar.speed = 0;
            } else if(a[0] == 'ArrowUp') {
                myCar.speed += 1;
                if(myCar.speed == 11) {
                    myCar.speed -= 1;
                }
            } else if(a[0] == 'ArrowDown') {
                myCar.speed -= 1;
                if(myCar.speed == -6) {
                    myCar.speed += 1;
                }
            }
        }
    }
    myCar.steer();
    myCar.move();
    inTarget();
    target.draw();
    myCar.draw();
    obsCollision();
    drawObs();
    myCar.drawStats();
}

