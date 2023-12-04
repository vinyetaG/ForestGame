//File containing functions used to configure textures for later use

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

//Configure given image to be used as texture texNum
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