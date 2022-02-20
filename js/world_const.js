let gravity = -49.5;
let eps = 1e-6;

function scal(v1, v2) {
    return v1.x*v2.x + v1.y*v2.y + v1.z*v2.z;
}

function vec(v1, v2) {
    return {x: v1.y*v2.z - v1.z*v2.y, y: v2.x*v1.z - v2.z*v1.x, z: v1.x*v2.y - v1.y*v2.y};
}

function len(v) {
    return Math.sqrt(v.x*v.x + v.y+v.y + v.z+v.z);
}

function direction(a, b) {
    return {x: b.x-a.x, y: b.y-a.y, z:b.z-a.z};
}

function scaleVec(a, k) {
    return {x: a.x*k, y: a.y*k, z: a.z*k};
}

function normalize(a) {
    var ll = len(a);
    return scaleVec(a, 1/ll);
}

class Ground extends GameObject {
    constructor (context, x,y,z, width, height, length, elasticity, scene) {
        super(context, x,y,z, 0,0,0, 1000);
        this.width = width;
        this.length = length;
        this. height = height;
        this.elasticity = elasticity;

        //threeJS Section
        let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({color: 0xa0afa4}));

        blockPlane.position.set(x, y, z);
        blockPlane.scale.set(width, height, length);

        blockPlane.castShadow = true;
        blockPlane.receiveShadow = true;

        scene.add(blockPlane);

        this.A1 = {x: this.x + this.width/2, y: this.y + this.height/2, z: this.z + this.length/2};
        this.B1 = {x: this.x + this.width/2, y: this.y + this.height/2, z: this.z - this.length/2};
        this.C1 = {x: this.x - this.width/2, y: this.y + this.height/2, z: this.z - this.length/2};
        this.D1 = {x: this.x - this.width/2, y: this.y + this.height/2, z: this.z + this.length/2};

        this.A2 = {x: this.x + this.width/2, y: this.y - this.height/2, z: this.z + this.length/2};
        this.B2 = {x: this.x + this.width/2, y: this.y - this.height/2, z: this.z - this.length/2};
        this.C2 = {x: this.x - this.width/2, y: this.y - this.height/2, z: this.z - this.length/2};
        this.D2 = {x: this.x - this.width/2, y: this.y - this.height/2, z: this.z + this.length/2};
    }

    oneEdgeDist(p1, p2, pt) {
        var AB = {x: p2.x-p1.x, y: p2.y-p1.y, z: p2.z-p1.z};
        var BA = {x: -AB.x, y: -AB.y, z: -AB.z};

        var PA = {x: p1.x-pt.x, y: p1.y-pt.y, z: p1.z-pt.z};

        var AP = {x: -PA.x, y: -PA.y, z: -PA.z};
        var BP = {x: pt.x-p2.x, y: pt.y-p2.y, z: pt.z-p2.z};

        if (scal(AB, AP) < 0) {
            return len(AP);
        }

        if (scal(BA, BP) < 0) {
            return len(BP);
        }

        var vecM = vec(PA, AB);
        
        return len(vecM) / len(AB);
    }

    edgeDist(obj) {
        var d = Math.min(this.oneEdgeDist(this.A1, this.B1, obj), 
                         this.oneEdgeDist(this.B1, this.C1, obj),
                         this.oneEdgeDist(this.C1, this.D1, obj),
                         this.oneEdgeDist(this.D1, this.A1, obj));
        
        return d;
    }

    getOneIntersectionWithBall(p1, p2, pt) {
        var AB = {x: p2.x-p1.x, y: p2.y-p1.y, z: p2.z-p1.z};
        var BA = {x: -AB.x, y: -AB.y, z: -AB.z};

        var PA = {x: p1.x-pt.x, y: p1.y-pt.y, z: p1.z-pt.z};

        var AP = {x: -PA.x, y: -PA.y, z: -PA.z};
        var BP = {x: pt.x-p2.x, y: pt.y-p2.y, z: pt.z-p2.z};

        if (scal(AB, AP) < 0) {
            if (len(AP) <= pt.r) {
                return p1;
            }
            return null;
        }

        if (scal(BA, BP) < 0) {
            if (len(BP) <= pt.r) {
                return p2;
            }
            return null;
        }

        var vecM = vec(PA, AB);
        
        if (len(vecM) / len(AB) > pt.r) {
            return null;
        }

        var lenAB = len(AB);
        var normAB = {x: AB.x/lenAB, y: AB.y/lenAB, z: AB.z/lenAB};
        var scalABAP = scal(normAB, AP);
        return {x: p1.x + normAB.x*scalABAP, y: p1.y + normAB.y*scalABAP, z: p1.z + normAB.z*scalABAP};
    }

    getIntersectionWithBall(obj) {
        var d = this.getOneIntersectionWithBall(this.A1, this.B1, obj);

        if (d != null) {
            return d;
        }
        
        d = this.getOneIntersectionWithBall(this.B1, this.C1, obj);

        if (d != null) {
            return d;
        }

        d = this.getOneIntersectionWithBall(this.B1, this.D1, obj);

        if (d != null) {
            return d;
        }

        d = this.getOneIntersectionWithBall(this.D1, this.A1, obj);

        if (d == null) {
            console.log("FUCK YOU");
            return null;
        }

        return d;
    }
}