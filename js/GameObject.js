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