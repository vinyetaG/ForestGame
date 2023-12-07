let canvas; 
let gl;

let uniformModelView, uniformProjection;
let viewMatrix, projectionMatrix;    

let trunksArr = [];
let leavesArr = [];

let ground = {
    positions: [
                vec3(-60, -2.0, -60),
                vec3(60, -2.0, -60),
                vec3(-60, -2.0, 60),
                vec3(60, -2.0, 60)
               ],
    normals: [
              vec3(0, 1, 0),
              vec3(0, 1, 0),
              vec3(0, 1, 0),
              vec3(0, 1, 0)
             ],
    texcoord: [
        vec3(-60, -2.0, -60),
        vec3(60, -2.0, -60),
        vec3(-60, -2.0, 60),
        vec3(60, -2.0, 60)
       ],
    indices: [0, 1, 2, 2, 3, 1]
}

let moon;
let groundVertices = [vec3(-60, 0, -60),
    vec3(60, 0, -60),
    vec3(-60, 0, 60),
    vec3(60, 0, 60),
]


let nf;
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
 
  
    //set up uniform variables
    uniformModelView = gl.getUniformLocation(program, "u_modelViewMatrix");
    uniformProjection = gl.getUniformLocation(program, "u_projectionMatrix");
    projectionMatrix = perspective(30, gl.canvas.width/gl.canvas.height, near, far);  
    gl.uniformMatrix4fv(uniformProjection, false, flatten(projectionMatrix));
 
    // Retrieve the nearFar element
	nf = document.getElementById('nearFar');
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
    
    //generateGround();
    generateMoon();

    draw();
}

//Populate array of trunks and leaves for each tree, set up possible
//gem positions
function generateForest() {
    // Array to store positions of trees with alternative textures
    for (let x = -50; x <= 50; x += 5) {
        for (let z = -50; z <= 50; z += 5) {
            if (x == 0) { continue; }
            possibleGemPos.push(vec3(x + 2.5, 0, z + 2.5));

            trunk = createTruncatedConeVertices(0.5, 0.5, 4.0, 30, 10, true, true);
            leaves = createTruncatedConeVertices(2.0, 0, 7.0, 30, 20, true, true);

            trunk.materialDiffuse =  vec4( 0.5, 0.35, 0.35, 1.0); 
            trunk.materialAmbient =  vec4( 1.0, 1.0, 1.0, 1.0 ); 
            trunk.materialSpecular = vec4( 0.5, 0.5, 0.5, 1.0 );
            trunk.materialShininess = 70.0;

            leaves.materialDiffuse =  vec4( 0.2, 0.35, 0.2, 1.0 ); 
            leaves.materialAmbient =  vec4( 0.5, 0.5, 0.5, 1.0 ); 
            leaves.materialSpecular = vec4( 0, 0, 0, 1.0 );
            leaves.materialShininess = 50.0;

            // Assign textures based on tree type
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
    let selectedIndices = [];
    while (selectedIndices.length < 4) {
        let randomIndex = Math.floor(Math.random() * trunksArr.length);
        if (!selectedIndices.includes(randomIndex)) {
            selectedIndices.push(randomIndex);
        }
    }

    for (let i = 0; i < selectedIndices.length; i++) {
        let index = selectedIndices[i];
        trunksArr[index].texture = 8;
        leavesArr[index].texture = 9;
    }
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
    lightPosition = vec4(moonPosition[0], moonPosition[1], moonPosition[2], 1.0);
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
    moonPosition = vec4(moonPosition[0], moonPosition[1], -moonPosition[2], 1.0);
}

function generateGround() {
    ground.positions = [
        vec3(-55, -2.0, -55), // Bottom-left corner
        vec3(55, -2.0, -55),  // Bottom-right corner
        vec3(-55, -2.0, 55),  // Top-left corner
        vec3(55, -2.0, 55)    // Top-right corner
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
 
	//Display the current near and far values (for testing purposes only)
	nf.innerHTML = 'near: ' + Math.round(near * 100)/100 + ', far: ' + Math.round(far*100)/100;

    //gl.uniform1i(gl.getUniformLocation(program, "u_textureMap"), 2);
    //drawVertexObject(ground);
    
    //Send down bark texture and render trunks
    trunksArr.forEach((trunk) => {
            gl.uniform1i(gl.getUniformLocation(program, "u_textureMap"), trunk.texture);
            drawVertexObject(trunk);
    });

    // Render only leaves with alternate texture (texture 8)
    leavesArr.forEach((leaves) => {
            gl.uniform1i(gl.getUniformLocation(program, "u_textureMap"), leaves.texture);
            drawVertexObject(leaves);
    });

    //Send down moon texture and render moon
    gl.uniform1i(gl.getUniformLocation(program, "u_textureMap"), 3);
    drawVertexObject(moon);

    drawGems();

    //Send down moon texture and render moon
    gl.uniform1i(gl.getUniformLocation(program, "u_textureMap"), 3);
    drawVertexObject(moon);
    //testGems();

    requestAnimationFrame(draw)
}