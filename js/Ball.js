class GameObject
{
    constructor (context, x, y, z, vx, vy, vz, mass){
        this.context = context;
        this.x = x;
        this.y = y;
        this.z = z;
        this.vx = vx;
        this.vy = vy;
        this.vz = vz;
        this.mass = mass;

        this.isColliding = false;
    }
}

class Ball extends GameObject
{
    constructor (context, x,y,z, vx,vy,vz, mass, r, color, scene) {
        super(context, x,y,z, vx,vy,vz, mass);

        this.r = r;

        this.ballMesh = new THREE.Mesh(new THREE.SphereBufferGeometry(r), new THREE.MeshPhongMaterial({color: color}));

        this.ballMesh.position.set(x, y, z);
        console.log(x, y, z);
        console.log(this.ballMesh);
        this.ballMesh.castShadow = true;
        this.ballMesh.receiveShadow = true;

        scene.add(this.ballMesh);
    }

    update(dt) {
        this.x += this.vx*dt;
        this.y += this.vy*dt;
        this.z += this.vz*dt;

        this.vy += gravity * dt;

        this.ballMesh.position.set(this.x, this.y, this.z);

        // console.log(this.vx, this.vy, this.vz, dt);
    }
}