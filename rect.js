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
    this.draw = function(ctx, color = '#A1A1A1'){
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.alpha);
        /* ctx.fillStyle = color;
        ctx.fillRect(-1, -1, this.w + 2, this.h + 2); */
        ctx.fillStyle = this.color;
        //ctx.lineWidth = 1;
        ctx.fillRect(0, 0, this.w, this.h);
        ctx.restore();
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