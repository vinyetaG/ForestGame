let diamond = {
    name: "diamond",
    positions: diamondMesh.vertices[0].values,
    indices: diamondMesh.connectivity[0].indices,
    normals:  diamondMesh.vertices[1].values,
    texcoord: diamondMesh.vertices[0].values,
    materialDiffuse: vec4( 0.8, 0.8, 0.85, 1.0),
    materialAmbient:  vec4( 0.8, 0.8, 0.85, 1.0),
    materialSpecular: vec4( 0.5, 0.5, 0.5, 1.0),
    materialShininess: 70.0,
    modelMatrix: mult(translate(0, -1.0, 0), mult(rotateX(90), mult(scalem(0.3, 0.2, 0.3), mat4())))
};

let ruby = {
    name: "ruby",
    positions: gemMesh.vertices[0].values,
    indices: gemMesh.connectivity[0].indices,
    normals:  gemMesh.vertices[1].values,
    texcoord: gemMesh.vertices[0].values,
    materialDiffuse: vec4( 0.8, 0.1, 0.1, 1.0),
    materialAmbient:  vec4( 0.85, 0.8, 0.8, 1.0),
    materialSpecular: vec4( 0.5, 0.5, 0.5, 1.0),
    materialShininess: 70.0,
    modelMatrix: mult(rotateX(90), mult(scalem(0.3, 0.2, 0.3), mat4()))
};

let sapphire = {
    name: "sapphire",
    positions: gemMesh.vertices[0].values,
    indices: gemMesh.connectivity[0].indices,
    normals:  gemMesh.vertices[1].values,
    texcoord: gemMesh.vertices[0].values,
    materialDiffuse: vec4( 0.1, 0.1, 0.8, 1.0),
    materialAmbient:  vec4( 0.8, 0.8, 0.85, 1.0),
    materialSpecular: vec4( 0.5, 0.5, 0.5, 1.0),
    materialShininess: 70.0,
    modelMatrix:  mult(scalem(0.05, 0.05, 0.05), mult(rotateX(90), mat4()))
};

let emerald = {
    name: "emerald",
    positions: gemMesh.vertices[0].values,
    indices: gemMesh.connectivity[0].indices,
    normals:  gemMesh.vertices[1].values,
    texcoord: gemMesh.vertices[0].values,
    materialDiffuse: vec4( 0.8, 0.8, 0.8, 1.0),
    materialAmbient:  vec4( 0.8, 0.8, 0.85, 1.0),
    materialSpecular: vec4( 0.5, 0.5, 0.5, 1.0),
    materialShininess: 70.0,
    modelMatrix: mult(scalem(0.05, 0.05, 0.05), mult(rotateX(90), mat4()))
};

let gems = [ruby, sapphire, emerald];
let possibleGemPos = [];
let gemPositions = [];
let usedLocs = [];
let activeGems = [];

function configureGems() {
    diamond.vao = setUpVertexObject(diamond);
    ruby.vao = setUpVertexObject(ruby);
    sapphire.vao = setUpVertexObject(sapphire);
    emerald.vao = setUpVertexObject(emerald);
}

//Select a random assortment of gems, which are then rendered at random (pre-set) locations
function placeGems() {
    // activeGems.push(diamond) //A diamond will always be available
    // let numGems = randInt(5, 7); //5-7 other gems will be generated

    // //Select random gems to place in the scene
    // for (let i = 0; i < numGems; i++) {
    //     randGem = gems[randInt(0, gems.length - 1)];
    //     activeGems.push(randGem);
    // }

    // //Select random available positions for each selected gem
    // //Modify each gem's model transform to translate them to said position
    // //And give each gem a property containing its new coordinates
    // for (let i = 0; i < activeGems.length; i++) {  
    //     do {
    //         randIndex = randInt(0, possibleGemPos.length - 1);
    //     } while (isDuplicateIndex(randIndex));
        
    //     randPos = possibleGemPos[randIndex];
    //     usedLocs.push(randIndex);
    //     gemPositions.push(randPos);
    //     console.log(activeGems[i].name + ": " + randPos); //For testing/demo purposes
    //     activeGems[i].modelMatrix = mult(translate(randPos[0], 0, randPos[2]), activeGems[i].modelMatrix);
    //     activeGems[i].loc = randPos;
    // }

    // //Render selected gems
    // for(let i = 0; i < activeGems.length; i++) {
    //     drawVertexObject(activeGems[i]);
    // }
    drawVertexObject(emerald);
    // drawVertexObject(diamond);

}

//Returns whether the given index of gem positions has already been used
function isDuplicateIndex(index) {
    for (let i = 0; i < usedLocs.length; i++) {
        if (usedLocs[i] == index) {
            return true;
        }
    }
    return false;
}


//Generate random integer between min and max (both inclusive)
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}