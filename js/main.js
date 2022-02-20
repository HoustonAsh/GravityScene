class main {
    constructor() {
        //variable declaration section

        this.groundObjects = [];
        this.gameObjects = [];
        

        start();
    }

    start (){
            
        setupGraphics();
        initObjects();
        renderFrame(); 

    }

  
    setupGraphics(){

        //create clock for timing
        this.clock = new THREE.Clock();

        //create the scene
        this.scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xbfd1e5 );

        //create camera
        this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 5000 );
        camera.position.set( 0, 30, 70 );
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        //Add hemisphere light
        let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
        hemiLight.color.setHSL( 0.6, 0.6, 0.6 );
        hemiLight.groundColor.setHSL( 0.1, 1, 0.4 );
        hemiLight.position.set( 0, 50, 0 );
        scene.add( hemiLight );

        //Add directional light
        let dirLight = new THREE.DirectionalLight( 0xffffff , 1);
        dirLight.color.setHSL( 0.1, 1, 0.95 );
        dirLight.position.set( -1, 1.75, 1 );
        dirLight.position.multiplyScalar( 100 );
        scene.add( dirLight );

        dirLight.castShadow = true;

        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;

        let d = 50;

        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;

        dirLight.shadow.camera.far = 13500;

        //Setup the renderer
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setClearColor( 0xbfd1e5 );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );

        renderer.gammaInput = true;
        renderer.gammaOutput = true;

        renderer.shadowMap.enabled = true;

    }

    initObjects(){
        this.groundObjects = [
            new Ground(this.context, 0,0,0, 50, 2, 50, 0.5, scene)
        ];
        this.gameObjects = [
            // new Ball(this.context, 0,50,0, 0,0,0, 10, 5, 0x00ff08, scene)
        ];
    }


    renderFrame(){
        let deltaTime = clock.getDelta();

        updatePhisics(deltaTime);
        renderer.render( scene, camera );
   
        requestAnimationFrame( renderFrame );
    }
    
    updatePhisics(deltaTime) { 
       
        for (let i = 0; i < this.gameObjects.length; i++) {
            this.gameObjects[i].update(secondsPassed);
        }
    }

    ballsIntersect(obj1, obj2) {
        return (obj1.x - obj2.x)*(obj1.x - obj2.x) + (obj1.y - obj2.y)*(obj1.y - obj2.y) + (obj1.z - obj2.z)*(obj1.z - obj2.z) <= (obj1.r + obj2.r)*(obj1.r + obj2.r);
    }

    groundIntersect(ground, obj) {
        if ((ground.x + ground.width/2 >= obj.x - obj.r || ground.x - ground.width/2 <= obj.x + obj.r ||
            ground.z + ground.length/2 >= obj.z - obj.r || ground.z - ground.length/2 <= obj.z + obj.r) &&
            ground.edgeDist(obj) <= obj.r) {
                return false;
            }

        return true;
    }

    groundSimpleIntersect(ground, obj) {
        if ((ground.x + ground.width/2 >= obj.x || ground.x - ground.width/2 <= obj.x ||
             ground.z + ground.length/2 >= obj.z || ground.z - ground.length/2 <= obj.z) &&
            ground.y + ground.height/2 <= obj.y - obj.r ) {
                return false;
            }

        return true;
    }

    manageGroundCollisions() {
        var groundObj;
        var obj;
        for (var i=0; i<this.groundObjects.length; i++) {
            groundObj = this.groundObjects[i];

            for (var j=0; j<this.gameObjects.length; j++) {
                obj = this.gameObjects[j];

                if (groundSimpleIntersect(groundObj, obj)) {
                    obj.vy = -obj.vy * groundObj.elasticity;
                } else if (groundIntersect(groundObj, obj)) {
                    var collisionPt = getIntersectionWithBall(obj);

                    if (collisionPt == null) {
                        return;
                    }

                    var collPlaneNorm = normalize(direction(collisionPt, obj));

                    var vel = {x: obj.vx, y: obj.vy, z: obj.vz};
                    var newV = direction(vel, scaleVec(collPlaneNorm, 2*scal(vel , collPlaneNorm)));

                    newV = scaleVec(newV, groundObj.elasticity);
                    
                    obj.vx = newV.x;
                    obj.vy = newV.y;
                    obj.vz = newV.z;
                }
            }
        }
    }

    manageBallsCollisions() {
        var obj1;
        var obj2;
    
        // for (var i = 0; i < this.gameObjects.length; i++) {
        //     this.gameObjects[i].isColliding = false;
        // }

        for (var i = 0; i < this.gameObjects.length; i++) {
            obj1 = this.gameObjects[i];
            for (var j = i + 1; j < this.gameObjects.length; j++) {
                obj2 = this.gameObjects[j];

                if (ballsIntersect(obj1, obj2)) {
                    // obj1.isColliding = true;
                    // obj2.isColliding = true;

                    var vCollision = {x: obj2.x - obj1.x, y: obj2.y - obj1.y, z: obj2.z - obj1.z};
                    var distance = Math.sqrt((obj2.x-obj1.x)*(obj2.x-obj1.x) + (obj2.y-obj1.y)*(obj2.y-obj1.y) + (obj2.z-obj1.z)*(obj2.z-obj1.z));
                    var vCollisionNorm = {x: vCollision.x / distance, y: vCollision.y / distance, z: vCollision.z / distance  };
                    var vRelativeVelocity = {x: obj1.vx - obj2.vx, y: obj1.vy - obj2.vy, z: obj1.vz - obj2.vz, };
                    var speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y + vRelativeVelocity.z * vCollisionNorm.z;
                    
                    if (speed < 0) {
                        break;
                    }
                    
                    var impulse = 2 * speed / (obj1.mass + obj2.mass);
                    obj1.vx -= (impulse * obj2.mass * vCollisionNorm.x);
                    obj1.vy -= (impulse * obj2.mass * vCollisionNorm.y);
                    obj1.vz -= (impulse * obj2.mass * vCollisionNorm.z);
                    obj2.vx += (impulse * obj1.mass * vCollisionNorm.x);
                    obj2.vy += (impulse * obj1.mass * vCollisionNorm.y);
                    obj2.vz += (impulse * obj1.mass * vCollisionNorm.z);
                }
                
            }
        }
    
    }
}