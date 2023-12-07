//File containing data related to modifying view matrix (camera movement)

let near = -5;
let far = 10;
let eyeX=0, eyeY=0.5, eyeZ=-30;
let atX=0, atY=0.5, atZ=-25;
let up = vec3(0.0, 1.0, 0.0);
const MOVE_STEP = 1.0;
const PAN_STEP = 3.0;
const X_BOUND = 60;
const Z_BOUND = 60;

//Key-press event handlers for moving the camera
function keydown(ev) {
    switch (ev.keyCode) {
        case 65: // 'a'key - pan camera left
            panL();
            break;
        case 68: // 'd'key - pan camera right
            panR();
            break;
        case 69: // 'e'key - check current eye position (only for testing/demoing)
            console.log(getEyePosition(viewMatrix));
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

//Move eye and at position forward in the view direction
function forward() {
    let eye = getEyePosition(viewMatrix);
    let at = vec3(atX, atY, atZ);

    let viewDirection = normalize(subtractV3V3(eye, at));
    let newEye = scaleAndAdd(true, viewDirection, eye);
    //Check new eye position is inbounds before moving
    if (newEye[0] < -X_BOUND || newEye[0] > X_BOUND ||
        newEye[2] < -Z_BOUND || newEye[2] > Z_BOUND) {
        return;
    }
    let newAt = scaleAndAdd(true, viewDirection, at);
    
    atX = newAt[0]; atY = newAt[1]; atZ = newAt[2];
    viewMatrix = lookAt(newEye, newAt, up);
    
    //Move moon forward by z component of view direction to give illusion of no movement
    moon.modelMatrix = mult(translate(0, 0, -1 * MOVE_STEP * viewDirection[2]), moon.modelMatrix);
    lanternPosition = newEye;
    checkForGemCollection();
    //console.log(lanternPosition);
}

//Move eye and at position backward in the view direction
function back() {
    let eye = getEyePosition(viewMatrix);
    let at = vec3(atX, atY, atZ);
    
    let viewDirection = normalize(subtractV3V3(eye, at));
    let newEye = scaleAndAdd(false, viewDirection, eye);
    //Check new eye position is inbounds before moving
    if (newEye[0] < -X_BOUND || newEye[0] > X_BOUND ||
        newEye[2] < -Z_BOUND || newEye[2] > Z_BOUND) {
        return;
    }
    let newAt = scaleAndAdd(false, viewDirection, at);
    
    atX = newAt[0]; atY = newAt[1]; atZ = newAt[2];
    viewMatrix = lookAt(newEye, newAt, up);

    //Move moon backwards by z component of view direction to give illusion of no movement
    moon.modelMatrix = mult(translate(0, 0, MOVE_STEP * viewDirection[2]), moon.modelMatrix);
    lanternPosition = newEye;
    checkForGemCollection();
    //console.log(lanternPosition);
}

//Pan camera left
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

//Pan camera right
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

//Get eye position from the given matrix
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