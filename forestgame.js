let canvas; 
let gl;

let near = -10;
let far = 10;
let eyeX=0, eyeY=0.5, eyeZ=-30;
let atX=0, atY=0.5, atZ=-25;
let up = vec3(0.0, 1.0, 0.0);
const MOVE_STEP = 1.0;
const PAN_STEP = 3.0;

let uniformModelView, uniformProjection;
let viewMatrix, projectionMatrix;    

let trunksArr = [];
let leavesArr = [];
// let groundVertices = [vec3(-60, 0, -60),
//     vec3(60, 0, -60),
//     vec3(-60, 0, 60),
//     vec3(60, 0, 60),
// ]

let lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
let lightAmbient = vec4(0.8, 0.8, 0.9, 1.0);
let lightSpecular = vec4(0.9, 0.9, 0.9, 1.0);

//Position is in homogeneous coordinates
//If w =1.0, we are specifying a finite (x,y,z) location
//If w =0.0, light at infinity
let lightPosition = vec4(2.0, 1.0, -5.0, 0.0);

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
    generateTrees();


    draw();
}

//Populate array of trunks and leaves for each tree
function generateTrees() { 
    for (let x = -50; x <= 50; x += 5) {
        for (let z = -50; z <= 50; z += 5) {
            if (x == 0) { continue; }
            let trunk =  createTruncatedConeVertices(0.5 ,0.5, 4.0, 30, 10, true, true);
            let leaves = createTruncatedConeVertices(2.0, 0, 7.0, 30, 20, true, true);

            trunk.materialDiffuse =  vec4( 0.5, 0.35, 0.35, 1.0); 
            trunk.materialAmbient =  vec4( 1.0, 1.0, 1.0, 1.0 ); 
            trunk.materialSpecular = vec4( 0.5, 0.5, 0.5, 1.0 );
            trunk.materialShininess = 70.0;

            leaves.materialDiffuse =  vec4( 0.2, 0.35, 0.2, 1.0 ); 
            leaves.materialAmbient =  vec4( 0.5, 0.5, 0.5, 1.0 ); 
            leaves.materialSpecular = vec4( 0, 0, 0, 1.0 );
            leaves.materialShininess = 50.0;
            trunk.modelMatrix =  mult(translate(x, 0, z), mat4());
            leaves.modelMatrix = mult(translate(x, 5.0, z), mat4());
            trunk.vao = setUpVertexObject(trunk);
            leaves.vao = setUpVertexObject(leaves);
            trunksArr.push(trunk); 
            leavesArr.push(leaves);
        }
    }
}

function draw(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
	//Display the current near and far values (for testing purposes only)
	nf.innerHTML = 'near: ' + Math.round(near * 100)/100 + ', far: ' + Math.round(far*100)/100;
    
    //Send down bark texture and draw trunks
    gl.uniform1i(gl.getUniformLocation(program, "u_textureMap"), 0);
    trunksArr.forEach((trunk) => drawVertexObject(trunk));

    //Send down leaves texture and draw leaves
    gl.uniform1i(gl.getUniformLocation(program, "u_textureMap"), 1);
    leavesArr.forEach((leaves) => drawVertexObject(leaves));

    requestAnimationFrame(draw)
}