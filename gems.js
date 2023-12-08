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
    modelMatrix: mult(translate(0, -1.0, 9), mult(rotateX(90), mult(scalem(0.3, 0.2, 0.3), mat4()))),
    texNum: 4
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
    modelMatrix:  mult(translate(0, -1, 9.5), mult(rotateX(90), mult(scalem(0.3, 0.2, 0.3), mat4()))),
    texNum: 5
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
    modelMatrix:  mult(translate(0, -1, 9.5), mult(rotateX(90), mult(scalem(0.3, 0.2, 0.3), mat4()))),
    texNum: 6
};

let emerald = {
    name: "emerald",
    positions: gemMesh.vertices[0].values,
    indices: gemMesh.connectivity[0].indices,
    normals:  gemMesh.vertices[1].values,
    texcoord: gemMesh.vertices[0].values,
    materialDiffuse: vec4( 0.1, 0.8, 0.1, 1.0),
    materialAmbient:  vec4( 0.8, 0.8, 0.85, 1.0),
    materialSpecular: vec4( 0.5, 0.5, 0.5, 1.0),
    materialShininess: 70.0,
    modelMatrix:  mult(translate(0, -1, 9.5), mult(rotateX(90), mult(scalem(0.3, 0.2, 0.3), mat4()))),
    texNum: 7
};

let gems = [ruby, sapphire, emerald];
let possibleGemPos = [];
let usedLocs = [];
let activeGems = [];
let selectedGems = [];
let collectedGems = [];
let targetColor = [0, 0, 0];

//Configures VAO for each gem type
function configureGems() {
    diamond.vao = setUpVertexObject(diamond);
    ruby.vao = setUpVertexObject(ruby);
    sapphire.vao = setUpVertexObject(sapphire);
    emerald.vao = setUpVertexObject(emerald);
}

//Select a random assortment of gems, and translate them to random locations
function placeGems() {
    console.log("Resetting arena.." + activeGems);
    collectedGems = [];
    activeGems = [];
    activeGems.push({...diamond}) //A diamond will always be available
    let numGems = randInt(5, 7); //5-7 other gems will be generated

    //Select random gems to place in the scene
    for (let i = 0; i < numGems; i++) {
        randGem = gems[randInt(0, gems.length - 1)];
        randGemCopy = {...randGem};
        activeGems.push(randGemCopy);
    }

    //Select random available positions for each selected gem
    //Modify each gem's model transform to translate them to said position
    //And give each gem a property containing its new coordinates
    for (let i = 0; i < activeGems.length; i++) {  
        do {
            randIndex = randInt(0, possibleGemPos.length - 1);
         } while (isDuplicateIndex(randIndex));
        
        randPos = possibleGemPos[randIndex];
        usedLocs.push(randIndex);
        console.log(activeGems[i].name + ": " + randPos); //For testing/demo purposes
        activeGems[i].modelMatrix = mult(translate(randPos[0], 0, randPos[2]), activeGems[i].modelMatrix);
        activeGems[i].loc = randPos;
    }
    console.log("") //testing/demo
    setTargetColor();
}

function setTargetColor() {
    let numGemsNeeded = randInt(3, activeGems.length - 2);
    let usedIndices = new Map();
    let i = 0;
    while (i < numGemsNeeded) {
        let randIndex = randInt(1, activeGems.length - 1)
        if (!usedIndices.has(randIndex)) {
            
            selectedGems.push(activeGems[randIndex]);
            usedIndices.set(randIndex, null);
            i++;
        }
    }
    console.log("Solution: ");
    console.log(selectedGems);
    console.log("");
    computeAvgColor(true);
}

//Renders active gems
function drawGems() {
    for(let i = 0; i < activeGems.length; i++) {
        gl.uniform1i(gl.getUniformLocation(program, "u_textureMap"), activeGems[i].texNum);
        drawVertexObject(activeGems[i]);
    }
   
}

//For testing purposes. Gems should be appear at the origin without further transformations.
function testGems() {
    let gemToTest = sapphire;
    gl.uniform1i(gl.getUniformLocation(program, "u_textureMap"), gemToTest.texNum);
    drawVertexObject(gemToTest);
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

//If camera is close enough to a gem, remove it
//from the list of active gems and add it to the user's
//collected gems. User's new color is then computed
function checkForGemCollection() {
    let currPosition = getEyePosition(viewMatrix);
    for (let i = 0; i < activeGems.length; i++) {
        if (isCollision(currPosition, activeGems[i].loc)) {
            if (activeGems[i].name == "diamond") {
                resetArena(); 
            }
            else {
                collectedGems.push(activeGems[i]);
                activeGems.splice(i, 1);
                console.log("Active gems: ");
                console.log(activeGems);
                console.log("");
                computeAvgColor(false);
            }
            
        }
    }
}

//Returns whether the coordinates of the first location are
//close enough to the second to be considered colliding
// (x within 2.5 and z within 1.5)
function isCollision(loc1, loc2) {
    if (Math.abs(loc1[0] - loc2[0]) <= 2.5  &&
        Math.abs(loc1[2] - loc2[2]) <= 1.5 ) {
        return true;
    }
    return false;
}

//Computes average color of given gem array and updates the appropriate color box
//If computing current color, checks for win condition and alerts user if they won
function computeAvgColor(isTarget) {
    let gemsArr = isTarget ? selectedGems : collectedGems
    let totalColor = [0, 0, 0]
    let avgColor = [0, 0, 0]
    let numGems = gemsArr.length;
    for(let i = 0; i < numGems; i++) {
        totalColor[0] += gemsArr[i].materialDiffuse[0];
        totalColor[1] += gemsArr[i].materialDiffuse[1];
        totalColor[2] += gemsArr[i].materialDiffuse[2];
    }
    avgColor[0] = totalColor[0] / numGems;
    avgColor[1] = totalColor[1] / numGems;
    avgColor[2] = totalColor[2] / numGems;

    //If not computing the color of the target, update the current color box
    //and check for win condition, alerting user if they won.
    //Else update the color of the target color box
    if (!isTarget) {
        console.log("Collected gems: ")
        console.log(collectedGems);
        console.log("");
        let currColorBox = document.getElementById("currColor");
        currColorBox.style.backgroundColor = `rgb(${avgColor[0] * 255}, ${avgColor[1] * 255}, ${avgColor[2] * 255})`;
        if (Math.abs(avgColor[0] - targetColor[0]) < 0.01 &&
            Math.abs(avgColor[1] - targetColor[1]) < 0.01 &&
            Math.abs(avgColor[2] - targetColor[2]) < 0.01) {
            alert("You won!");
            resetArena();  
        }
    } else {
        let targetColorBox = document.getElementById("targetColor");
        targetColor = [avgColor[0], avgColor[1], avgColor[2]];
        targetColorBox.style.backgroundColor = `rgb(${avgColor[0] * 255}, ${avgColor[1] * 255}, ${avgColor[2] * 255})`;
        
    }
    
}

//Returns whether the coordinates of the first location are
//close enough to the second to be considered colliding
// (x within 9.25 and z within 8.25)
function isApproachingTree(loc1, loc2) {
    if (Math.abs(loc1[0] - loc2[0]) <= 9.25  &&
        Math.abs(loc1[2] - loc2[2]) <= 8.25 ) {
        return true;
    }
    return false;
}

// Check to see if the player is near an evil tree
// and if so, remove a gem
function checkAndRemoveGemIfNearEvilTree() {
    let eye = getEyePosition(viewMatrix);
    for (let i = 0; i < alternativeTrees.length; i++) {
        if (isApproachingTree(alternativeTrees[i].position, eye)) { 
            removeRandomGem();
        }
    }
}

// Removes a random gem from the player's collected gems and 
// alerts that it has been removed and what gem was removed
function removeRandomGem() {
    if (collectedGems.length > 0) {
        let randomIndex = Math.floor(Math.random() * collectedGems.length);
        let removedGem = collectedGems.splice(randomIndex, 1)[0];
        console.log("A gem has been taken: " + removedGem.name);
        alert("A gem has been taken: " + removedGem.name + "!");
        if(collectedGems.length == 0) {
            let currColorBox = document.getElementById("currColor");
            currColorBox.style.backgroundColor = `rgb(0, 0 , 0)`;
        } else {
            computeAvgColor(false);
        }
    }
}

//Select new random gem positions and target color, clear current color
function resetArena() {
    usedLocs = [];
    collectedGems = [];
    activeGems = [];
    selectedGems = [];
    placeGems();
    let currColorBox = document.getElementById("currColor");
    currColorBox.style.backgroundColor = "rgb(0, 0, 0, 1)";
}

//Returns random integer between min and max (both inclusive)
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}