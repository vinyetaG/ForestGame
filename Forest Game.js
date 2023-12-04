let canvas; 
let gl;

let near = -10;
let far = 10;

const MOVE_STEP = 1.0;
const PAN_STEP = 3.0;

let trunksArr = [];
let leavesArr = [];
let eyeX=0, eyeY=0, eyeZ=-30;
let atX=0, atY=0, atZ=-25;
let up = vec3(0.0, 1.0, 0.0);

let uniformModelView, uniformProjection;
let viewMatrix, projectionMatrix;    

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
 
    configureTextures();
    generateTrees();
    //Create array of shapes

    //Initialize VAO and model transform for each shape

    //Update model transform and material properties for each shape
    
    
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
    
    draw();
}

//Generate array of trees, comprised of trunks and leaves
function generateTrees() { 
    for (let x = -25; x <= 25; x +=5) {
        for (let z = -25; z <= 25; z += 5) {
            if (x == 0) { continue; }
            let trunk =  createTruncatedConeVertices(0.5 ,0.5, 4.0, 30, 10, true, true);
            let leaves = createTruncatedConeVertices(2.0, 0, 7.0, 30, 20, true, true);

            trunk.materialDiffuse =  vec4( 0.5, 0.35, 0.35, 1.0); 
            trunk.materialAmbient =  vec4( 1.0, 1.0, 1.0, 1.0 ); 
            trunk.materialSpecular = vec4( 0, 1.0, 1.0, 1.0 );
            trunk.materialShininess = 70.0;

            leaves.materialDiffuse =  vec4( 0.2, 0.35, 0.2, 1.0 ); 
            leaves.materialAmbient =  vec4( 0.5, 0.5, 0.5, 1.0 ); 
            leaves.materialSpecular = vec4( 0, 0, 0, 1.0 );
            leaves.materialShininess = 50.0;
            trunk.modelMatrix =  mult(translate(x, -0.5, z), mat4());
            leaves.modelMatrix = mult(translate(x, 5.0, z), mat4());
            trunk.vao = setUpVertexObject(trunk);
            leaves.vao = setUpVertexObject(leaves);
            trunksArr.push(trunk); 
            leavesArr.push(leaves);
        }
    }
}

//Configure textures used by the game to later be sent down to GPU
function configureTextures() {
    let bark = new Image();
    bark.src = document.getElementById("bark").src; 
    bark.onload = function() {
        configureTexture(0, bark, program);
    }

    let leaves = new Image();
    leaves.src = document.getElementById("leaves").src; 
    leaves.onload = function() {
        configureTexture(1, leaves, program);
    }

}

function configureTexture(texNum, image, program ) {
    texture = gl.createTexture();
    switch(texNum) {
        case 0: gl.activeTexture( gl.TEXTURE0 ); break;
        case 1: gl.activeTexture( gl.TEXTURE1 ); break;
        case 2: gl.activeTexture( gl.TEXTURE2 ); break;
        case 3: gl.activeTexture( gl.TEXTURE3 ); break;
    }
    //gl.activeTexture( gl.TEXTURE0 );  //0 active by default
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    //Flip the Y values to match the WebGL coordinates
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    
    //Specify the image as a texture array:
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
         
    //Set filters and parameters
    gl.generateMipmap(gl.TEXTURE_2D);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT );
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

//Draws each shape using its VAO, model matrix, and material properties
function drawVertexObject(shape){
    let ambientProduct = mult(lightAmbient, shape.materialAmbient);
    let diffuseProduct = mult(lightDiffuse, shape.materialDiffuse);
    let specularProduct = mult(lightSpecular, shape.materialSpecular);
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), shape.materialShininess);
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );

    let modelViewMatrix = mult(viewMatrix, shape.modelMatrix);
    gl.uniformMatrix4fv(uniformModelView, false, flatten(modelViewMatrix));

    gl.bindVertexArray(shape.vao);
    gl.drawElements(gl.TRIANGLES, shape.indices.length, gl.UNSIGNED_SHORT, 0);     
}
 
//Sets up a VAO 
function setUpVertexObject(shape){
    let indices = shape.indices;
    let vertices = shape.positions;
    let normals = shape.normals;

    vao = gl.createVertexArray(); 
    gl.bindVertexArray(vao); 
    
    //set up index buffer, if using
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());    
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STREAM_DRAW);
    
    //For each attribute (e.g. each of vertices, normal, color, etc.)
 
    //set up vertices buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); 
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STREAM_DRAW);
    let attributeCoords  = gl.getAttribLocation(program, "a_coords"); 
    gl.vertexAttribPointer(attributeCoords, 3, gl.FLOAT, false, 0, 0);  
    gl.enableVertexAttribArray(attributeCoords);
 
    //set up normals buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); 
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STREAM_DRAW);
    let attributeNormals = gl.getAttribLocation( program, "a_normals" );
    gl.vertexAttribPointer( attributeNormals, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( attributeNormals );

    //set up texture coord buffer
    gl.bufferData(gl.ARRAY_BUFFER, flatten(shape.texcoord), gl.STATIC_DRAW);
    let texCoordLoc = gl.getAttribLocation(program, "a_texCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    //finalize the vao; not required, but considered good practice
    gl.bindVertexArray(null); 
    return vao;
}

//Move eye and at position forward in the view direction
function forward() {
    let eye = getEyePosition(viewMatrix);
    let at = vec3(atX, atY, atZ);

    let viewDirection = normalize(subtractV3V3(eye, at));
    let newEye = scaleAndAdd(true, viewDirection, eye);
    let newAt = scaleAndAdd(true, viewDirection, at);
    
    atX = newAt[0]; atY = newAt[1]; atZ = newAt[2];
    viewMatrix = lookAt(newEye, newAt, up);
}

//Move eye and at position backward in the view direction
function back() {
    let eye = getEyePosition(viewMatrix);
    let at = vec3(atX, atY, atZ);
    
    let viewDirection = normalize(subtractV3V3(eye, at));
    let newEye = scaleAndAdd(false, viewDirection, eye);
    let newAt = scaleAndAdd(false, viewDirection, at);
    
    atX = newAt[0]; atY = newAt[1]; atZ = newAt[2];
    viewMatrix = lookAt(newEye, newAt, up);
}

function panL(){
    let eye = getEyePosition(viewMatrix);
    let at = vec4(atX, atY, atZ, 1);
    at = mult(translate(-eye[0], -eye[1], -eye[2]), at);
    at = mult(rotateY(PAN_STEP), at);
    at = mult(translate(eye[0], eye[1], eye[2]), at);

    atX = at[0]; 
    atY = at[1]; 
    atZ = at[2];
    at = vec3(atX, atY, atZ);
    viewMatrix = lookAt(eye, at, up);
}

function panR(){
    let eye = getEyePosition(viewMatrix);
    let at = vec4(atX, atY, atZ, 1);
    at = mult(translate(-eye[0], -eye[1], -eye[2]), at);
    at = mult(rotateY(-PAN_STEP), at);
    at = mult(translate(eye[0], eye[1], eye[2]), at);

    atX = at[0]; 
    atY = at[1]; 
    atZ = at[2];
    at = vec3(atX, atY, atZ);
    viewMatrix = lookAt(eye, at, up);
}

function keydown(ev) {
    switch (ev.keyCode) {
        case 65: // 'a'key - pan camera left
            panL();
            break;
        case 68: // 'd'key - pan camera right
            panR();
            break;
        case 87: // 'w' key - move forward
            forward();
            break;
        case 83: // 's' key - move backward
            back();
            break;
        default: return; //skip drawing
    }
}

function getEyePosition( mv ){
    let u = vec3(mv[0][0],mv[0][1],mv[0][2]);       
    let v = vec3(mv[1][0],mv[1][1],mv[1][2]); 
    let n = vec3(mv[2][0],mv[2][1],mv[2][2]); 
    let t = vec3(mv[0][3],mv[1][3],mv[2][3]);

    let axesInv = inverse3([u,v,n]);
    let eye = multM3V3(axesInv,t);
    return vec3(-eye[0],-eye[1],-eye[2]);
}

function multM3V3( u, v ) {
    let result = [];
    result[0] = u[0][0]*v[0] + u[0][1]*v[1] + u[0][2]*v[2];
    result[1] = u[1][0]*v[0] + u[1][1]*v[1] + u[1][2]*v[2];
    result[2] = u[2][0]*v[0] + u[2][1]*v[1] + u[2][2]*v[2];
    return result;
}

// function setEyePosition( mv, eye ){
//     let u = vec3(mv[0][0],mv[0][1],mv[0][2]);       
//     let v = vec3(mv[1][0],mv[1][1],mv[1][2]); 
//     let n = vec3(mv[2][0],mv[2][1],mv[2][2]); 

//     let negEye = vec3(-eye[0], -eye[1], -eye[2]);
//     mv[0][3] = dot(negEye,u);
//     mv[1][3] = dot(negEye,v);
//     mv[2][3] = dot(negEye,n);
// }

//Subtract two 3D vectors (a - b)
function subtractV3V3(a, b) {
    let x = a[0] - b[0];
    let y = a[1] - b[1];
    let z = a[2] - b[2];
    return vec3(x, y, z);
}

//Add normalized vector a * MOVE_STEP to b for 
//with MOVE_STEP determining degree of movement
//Magnitude of a is inverted if doing forward movement
function scaleAndAdd(forward, a, b) {
    let out = vec3();

    //Invert magnitude of a for proper forward movement
    if (forward) {
        a[0] *= -1; a[1] *= -1; a[2] *= -1;
    }
    out[0] = b[0] + (a[0] * MOVE_STEP);
    out[1] = b[1] + (a[1] * MOVE_STEP);
    out[2] = b[2] + (a[2] * MOVE_STEP); 
    //If doing forward movement, revert vector a to normal for later use
    if (forward) {
        a[0] *= -1; a[1] *= -1; a[2] *= -1;
    }
    return out;
}