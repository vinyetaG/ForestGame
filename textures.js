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

    let grass = new Image();
    grass.src = document.getElementById("grass").src; 
    grass.onload = function() {
        configureTexture(2, grass, program);
    }

    let moon = new Image();
    moon.src = document.getElementById("moon").src; 
    moon.onload = function() {
        configureTexture(3, moon, program);
    }

    let diamond = new Image();
    diamond.src = document.getElementById("diamond").src; 
    diamond.onload = function() {
        configureTexture(4, diamond, program);
    }

    let ruby = new Image();
    ruby.src = document.getElementById("ruby").src; 
    ruby.onload = function() {
        configureTexture(5, ruby, program);
    }

    let sapphire = new Image();
    sapphire.src = document.getElementById("sapphire").src; 
    sapphire.onload = function() {
        configureTexture(6, sapphire, program);
    }

    let emerald = new Image();
    emerald.src = document.getElementById("emerald").src; 
    emerald.onload = function() {
        configureTexture(7, emerald, program);
    }
     
}

//Configure given image to be used as texture number texNum
function configureTexture(texNum, image, program ) {
    texture = gl.createTexture();
    switch(texNum) {
        case 0: gl.activeTexture( gl.TEXTURE0 ); break;
        case 1: gl.activeTexture( gl.TEXTURE1 ); break;
        case 2: gl.activeTexture( gl.TEXTURE2 ); break;
        case 3: gl.activeTexture( gl.TEXTURE3 ); break;
        case 4: gl.activeTexture( gl.TEXTURE4 ); break;
        case 5: gl.activeTexture( gl.TEXTURE5 ); break;
        case 6: gl.activeTexture( gl.TEXTURE6 ); break;
        case 7: gl.activeTexture( gl.TEXTURE7 ); break;
        case 8: gl.activeTexture( gl.TEXTURE8 ); break;
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