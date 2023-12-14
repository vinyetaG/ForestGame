let canvas; 
let gl;

let uniformModelView, uniformProjection;
let viewMatrix, projectionMatrix;    

let trunksArr = [];
let leavesArr = [];
let alternativeTrees = [];

let evilTreeSound;
let moon;
let logs;
let fire;
let program;

function init(){

	//Get graphics context
    let canvas = document.getElementById( "gl-canvas" );
	let  options = {  // no need for alpha channel, but note depth buffer enabling
		alpha: false,
		depth: true  //NOTE THIS
	};

	gl = canvas.getContext("webgl2", options);
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

	//Load shaders
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );
 
    walkingSound = document.getElementById("walkingSound");
    document.addEventListener('keyup', keyup);

    dingSound = document.getElementById("dingSound");

    evilTreeSound = document.getElementById("evilTreeSound");

    //set up uniform variables
    uniformModelView = gl.getUniformLocation(program, "u_modelViewMatrix");
    uniformProjection = gl.getUniformLocation(program, "u_projectionMatrix");
    projectionMatrix = perspective(30, gl.canvas.width/gl.canvas.height, near, far);  
    gl.uniformMatrix4fv(uniformProjection, false, flatten(projectionMatrix));
 
    // buttons for moving viewer and changing size

    document.onkeydown = function (ev) { keydown(ev); };
 
    //set up screen
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); 
    gl.clearColor(0, 0, 0, 1); 
    
    //Enable depth testing    
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

    let eye = vec3(eyeX, eyeY, eyeZ);
    let at = vec3(atX, atY, atZ);
    viewMatrix = lookAt(eye, at, up);
    configureTextures();

 //-----------------------------------------------------------------------
    generateForest();
    configureGems();
    placeGems();
    computeAvgColor(); 
    generateMoon();
    placeLogs();
    placeFire();
    
    //generateGround();
    generateMoon();

    draw();
}

function placeLogs() {
    logs = {
        name: "logs",
        positions: logsMesh.vertices[0].values,
        indices: logsMesh.connectivity[0].indices,
        normals:  logsMesh.vertices[1].values,
        texcoord: logsMesh.vertices[0].values,
        materialDiffuse: vec4( 0.8, 0.8, 0.85, 1.0),
        materialAmbient:  vec4( 0.8, 0.8, 0.85, 1.0),
        materialSpecular: vec4( 0.5, 0.5, 0.5, 1.0),
        materialShininess: 70.0,
        modelMatrix: translate(0, -1, 25),
        texNum: 10
    };
    logs.vao = setUpVertexObject(logs);
}

function placeFire() {
    fire = {
        name: "fire",
        positions: fireMesh.vertices[0].values,
        indices: fireMesh.connectivity[0].indices,
        normals:  fireMesh.vertices[1].values,
        texcoord: fireMesh.vertices[0].values,
        materialDiffuse: vec4( 0.8, 0.8, 0.85, 1.0),
        materialAmbient:  vec4( 0.8, 0.8, 0.85, 1.0),
        materialSpecular: vec4( 0.5, 0.5, 0.5, 1.0),
        materialShininess: 70.0,
        modelMatrix: translate(0, -0.9, 25),
        texNum: 11
    };
    fire.vao = setUpVertexObject(fire);
}

//Populate array of trunks and leaves for each tree, set up possible
//gem positions
function generateForest() {
    for (let x = -50; x <= 50; x += 5) {
        for (let z = -50; z <= 50; z += 5) {
            if (x == 0) { continue; }
            possibleGemPos.push(vec3(x + 2.5, 0, z + 2.5));

            let trunk = createTruncatedConeVertices(0.5, 0.5, 4.0, 30, 10, true, true);
            let leaves = createTruncatedConeVertices(2.0, 0, 7.0, 30, 20, true, true);

            trunk.materialDiffuse =  vec4( 0.5, 0.35, 0.35, 1.0); 
            trunk.materialAmbient =  vec4( 1.0, 1.0, 1.0, 1.0 ); 
            trunk.materialSpecular = vec4( 0.5, 0.5, 0.5, 1.0 );
            trunk.materialShininess = 70.0;

            leaves.materialDiffuse =  vec4( 0.2, 0.35, 0.2, 1.0 ); 
            leaves.materialAmbient =  vec4( 0.5, 0.5, 0.5, 1.0 ); 
            leaves.materialSpecular = vec4( 0, 0, 0, 1.0 );
            leaves.materialShininess = 50.0;

            trunk.texture = 0;
            leaves.texture = 1;

            trunk.modelMatrix = mult(translate(x, 0, z), mat4());
            leaves.modelMatrix = mult(translate(x, 5.0, z), mat4());

            trunk.vao = setUpVertexObject(trunk);
            leaves.vao = setUpVertexObject(leaves);

            trunksArr.push(trunk);
            leavesArr.push(leaves);
        }
    }

    // Select a few trees to have alternative textures
    let selectedIndices = [];
    while (selectedIndices.length < 4) {
        let randomIndex = Math.floor(Math.random() * trunksArr.length);
        if (!selectedIndices.includes(randomIndex)) {
            selectedIndices.push(randomIndex);
        }
    }

    // Add alternative trees' data to the alternativeTrees array
    for (let i = 0; i < selectedIndices.length; i++) {
        let index = selectedIndices[i];
        trunksArr[index].texture = 8; // Texture index for alternative trunk
        leavesArr[index].texture = 9; // Texture index for alternative leaves

        // Add to alternativeTrees array
        alternativeTrees.push({
            position: vec3(trunksArr[index].modelMatrix[0][3], trunksArr[index].modelMatrix[1][3], trunksArr[index].modelMatrix[2][3])
        });
        console.log("Evil Tree " + (i + 1) + ": " + alternativeTrees[i].position);
    }
    console.log("");
}

//Generate moon as a primary light source
function generateMoon() {
    let moonRadius = 3; 
    let moonPosition = vec3(0, 15, 60); 
    moon = createSphereVertices(moonRadius, 30, 30);
    moon.materialDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
    moon.materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
    moon.materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
    moon.materialShininess = 200.0;
    moon.modelMatrix = translate(moonPosition[0], moonPosition[1], moonPosition[2]);
    moon.vao = setUpVertexObject(moon);
    lightPosition = vec4(moonPosition[0], moonPosition[1], moonPosition[2], 0.0);
}

function generateMoon() {
    let moonRadius = 3; 
    let moonPosition = vec4(0, 15, 60, 1.0); 
    moon = createSphereVertices(moonRadius, 30, 30);
    moon.materialDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
    moon.materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
    moon.materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
    moon.materialShininess = 200.0;
    moon.modelMatrix = translate(moonPosition[0], moonPosition[1], moonPosition[2]);
    moon.vao = setUpVertexObject(moon);
    moonPosition = vec4(moonPosition[0], moonPosition[1], -moonPosition[2], 0.0);
}

function generateGround() {
    ground.positions = [
        vec3(-55, -2.0, -55), 
        vec3(55, -2.0, -55), 
        vec3(-55, -2.0, 55), 
        vec3(55, -2.0, 55)  
    ];
    
    ground.normals = [
        vec3(0, 1, 0),
        vec3(0, 1, 0),
        vec3(0, 1, 0),
        vec3(0, 1, 0)
    ];
    
    ground.texcoord = [
        vec2(0, 0),
        vec2(1, 0),
        vec2(0, 1),
        vec2(1, 1)
    ];
    
    ground.indices = [0, 1, 2, 2, 3, 1];
    
    ground.materialDiffuse = vec4(0.35, 0.35, 0.50, 1.0); 
    ground.materialAmbient = vec4(0.2, 0.5, 0.2, 1.0); 
    ground.materialSpecular = vec4(0.3, 0.9, 0.5, 1.0);
    ground.materialShininess = 80.0;
    ground.modelMatrix = mat4();
    ground.vao = setUpVertexObject(ground);
}

function draw(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
    //gl.uniform1i(gl.getUniformLocation(program, "u_textureMap"), 2);
    //drawVertexObject(ground);
    
    //Send down bark texture and render trunks
    trunksArr.forEach((trunk) => {
            gl.uniform1i(gl.getUniformLocation(program, "u_textureMap"), trunk.texture);
            drawVertexObject(trunk);
    });

    // Send down leaves texture and render leaves
    leavesArr.forEach((leaves) => {
            gl.uniform1i(gl.getUniformLocation(program, "u_textureMap"), leaves.texture);
            drawVertexObject(leaves);
    });

    //Send down moon texture and render moon
    gl.uniform1i(gl.getUniformLocation(program, "u_textureMap"), 3);
    drawVertexObject(moon);

    drawGems();

    //Send down log texture and render logs for campfire
    gl.uniform1i(gl.getUniformLocation(program, "u_textureMap"), logs.texNum);
    drawVertexObject(logs);

    //Send down fire texture and render fire for campfire
    gl.uniform1i(gl.getUniformLocation(program, "u_textureMap"), fire.texNum);
    drawVertexObject(fire);

    //Send down moon texture and render moon
    gl.uniform1i(gl.getUniformLocation(program, "u_textureMap"), 3);
    drawVertexObject(moon);

    requestAnimationFrame(draw);
}