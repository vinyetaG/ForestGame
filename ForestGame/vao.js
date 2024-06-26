//File containing functions for configuring and drawing vertex array objects

let moonDiffuse = vec4(0.2, 0.2, 0.3, 1.0);
let moonAmbient = vec4(0.15, 0.15, 0.2, 1.0);  
let moonSpecular = vec4(0.3, 0.3, 0.35, 1.0); 
let moonlightPosition = vec4();

let lanternDiffuse = vec4(0.8, 0.3, 0.2, 1.0);
let lanternAmbient = vec4(0.6, 0.3, 0.3, 1.0);  
let lanternSpecular = vec4(0.25, 0.1, 0.1, 1.0); 
let lanternPosition = vec4();                  

//Draws each shape using its VAO, model matrix, and material properties
function drawVertexObject(shape){
    let ambientMoonProduct = mult(moonAmbient, shape.materialAmbient);
    let diffuseMoonProduct = mult(moonDiffuse, shape.materialDiffuse);
    let specularMoonProduct = mult(moonSpecular, shape.materialSpecular);

    let ambientLanternProduct = mult(lanternAmbient, shape.materialAmbient);
    let diffuseLanternProduct = mult(lanternDiffuse, shape.materialDiffuse);
    let specularLanternProduct = mult(lanternSpecular, shape.materialSpecular);

    gl.uniform1f(gl.getUniformLocation(program, "shininess"), shape.materialShininess);
    gl.uniform4fv(gl.getUniformLocation(program, "moonAmbientProduct"),flatten(ambientMoonProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "moonDiffuseProduct"),flatten(diffuseMoonProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "moonSpecularProduct"), flatten(specularMoonProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "moonLightPosition"), flatten(moonlightPosition) );

    gl.uniform4fv(gl.getUniformLocation(program, "lanternAmbientProduct"),flatten(ambientLanternProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lanternDiffuseProduct"),flatten(diffuseLanternProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "lanternSpecularProduct"), flatten(specularLanternProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lanternPosition"), flatten(lanternPosition) );
    
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
    let texCoords = shape.texcoord;

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
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); 
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);
    let texCoordLoc = gl.getAttribLocation(program, "a_texCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    //finalize the vao; not required, but considered good practice
    gl.bindVertexArray(null); 
    return vao;
}