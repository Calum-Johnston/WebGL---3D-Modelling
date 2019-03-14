// Computer Graphics Coursework: By Calum Johnston

/*
===============================
SHADERS
===============================
*/

// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n' +   

  'uniform mat4 u_ModelMatrix;\n' +    // Rotation/translation/scaling information
  'uniform mat4 u_NormalMatrix;\n' +   // Transformation matrix of normal
  'uniform mat4 u_ViewMatrix;\n' +     // Eye point, look up point, up direction
  'uniform mat4 u_ProjMatrix;\n' +     // Sets viewing volume
 
  'uniform vec3 u_LightColor;\n' +     // Light color
  'uniform vec3 u_LightDirection;\n' + // Light direction
  'uniform vec3 u_AmbientLight;\n' +   // Color of an ambient light
  'varying vec4 v_Color;\n' +
  'uniform vec4 u_Color;\n' +
 
  'uniform bool u_isLighting;\n' +    
 
  'void main() {\n' +

     // Calculates position of vertex
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
  
     // If the object requires lighting 
  '  if(u_isLighting)\n' + 
  '  {\n' +
  '     vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);\n' +
  
        // The dot product of the light direction and the normal
  '     float nDotL = max(dot(normal, u_LightDirection), 0.0);\n' +
        // Calculate the color due to diffuse reflection
  '     vec3 diffuse = u_LightColor * u_Color.rgb * nDotL;\n' +

        // Calculate the color due to ambient reflection
  '     vec3 ambient = u_AmbientLight * u_Color.rgb;\n' +
  
        // Adds surface colors due to diffuse and ambient reflection
  '     v_Color = vec4(diffuse + ambient, u_Color.a);\n' +  '  }\n' +
  '  else\n' +
  '  {\n' +
  '     v_Color = u_Color;\n' +
  '  }\n' + 
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +

     // Gives the vertex a particular color
  '  gl_FragColor = v_Color;\n' +
  '}\n';





/*
===============================
Main Methods
===============================
*/

// Key matrices for drawing
var modelMatrix = new Matrix4(); // The model matrix
var viewMatrix = new Matrix4();  // The view matrix
var projMatrix = new Matrix4();  // The projection matrix
var g_normalMatrix = new Matrix4();  // Coordinate transformation matrix for normals (used for lighting)

// Key variables for movement
var forward_backDist = 0.2;
var left_rightDist = 0.2;
var up_downDist = 0.2;
var panup_downDist = 0.02;

// Key variables for camera
var g_xCord = -3.9;
var g_yCord = 2.5;
var g_zCord = 28.8;
var g_yLook = 2.43;
var g_xDegree = 1;
var g_zDegree = 1;
var angle = Math.PI + 0.8;  // Radians

// Key variables for key pressing
// Allows multiple movements to (appear) to work together
var g_wKey = false;
var g_Akey = false;
var g_Skey = false;
var g_Dkey = false;
var g_UPkey = false;
var g_LEFTkey = false;
var g_DOWNkey = false;
var g_RIGHTkey = false;
var g_SPACEkey = false;
var g_Ckey = false;

// Main function
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set clear color and enable hidden surface removal
  gl.clearColor(204 / 256, 204 / 256, 204 / 256, 1.0);  // Blue
  gl.enable(gl.DEPTH_TEST);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Get the storage locations of uniform attributes
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  var u_Color = gl.getUniformLocation(gl.program, 'u_Color');

  // Trigger to define whether lighting is used or not
  var u_isLighting = gl.getUniformLocation(gl.program, 'u_isLighting'); 

  // Checks all uniform variables have been retrieved correctly
  if (!u_ModelMatrix || !u_ViewMatrix || !u_NormalMatrix ||
      !u_ProjMatrix || !u_LightColor || !u_LightDirection ||
      !u_isLighting || !u_Color) { 
    console.log('Failed to get the storage locations of a variable');
    return;
  }

  // LIGHT RELATED STUFF
  // Set the light color 
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  // Set the ambient light color 
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);
  // Set the light direction (in the world coordinate)
  var lightDirection = new Vector3([0.5, 3.0, 4.0]);
  lightDirection.normalize();     // Normalize
  gl.uniform3fv(u_LightDirection, lightDirection.elements);

  var drawWorld = function(){
    document.onkeydown = function(ev){
      checkKeyDown(ev);
    };
    document.onkeyup = function(ev){
      checkKeyUp(ev);
    };
    moveCameraPerspective();
    draw(gl, u_ModelMatrix, u_NormalMatrix, u_ViewMatrix, u_ProjMatrix, u_isLighting, u_Color, canvas);
    requestAnimationFrame(drawWorld);
  }

  // Calls drawWorld() continously
  drawWorld();
}
 




/*
===============================
MOUSE & KEY PRESSING
===============================
*/

function checkKeyUp(ev){
  switch(ev.keyCode){
    case 40: g_UPkey = false; break; //Up Arrow Key
    case 38: g_DOWNkey = false; break; //Down Arrow Key
    case 39: g_RIGHTkey = false; break; //Right Arrow Key
    case 37: g_LEFTkey = false; break; //Left Arrow Key
    case 87: g_wKey = false; break; //W Key
    case 83: g_Skey = false; break; //S Key
    case 65: g_Akey = false; break; //A Key
    case 68: g_Dkey = false; break; //D Key
    case 32: g_SPACEkey = false; break; //Space Key
    case 67: g_Ckey = false; break; //C Key
  }
}

function checkKeyDown(ev){
  switch(ev.keyCode){
    case 40: g_UPkey = true; break; //Up Arrow Key
    case 38: g_DOWNkey = true; break; //Down Arrow Key
    case 39: g_RIGHTkey = true; break; //Right Arrow Key
    case 37: g_LEFTkey = true; break; //Left Arrow Key
    case 87: g_wKey = true; break; //W Key
    case 83: g_Skey = true; break; //S Key
    case 65: g_Akey = true; break; //A Key
    case 68: g_Dkey = true; break; //D Key
    case 32: g_SPACEkey = true; break; //Space Key
    case 67: g_Ckey = true; break; //C Key
  }
}

// Move Camera based on what key has been pressed
function moveCameraPerspective() {
  document.getElementById("angle").innerHTML = angle;
  g_xDegree = Math.cos(angle) - Math.sin(angle);
  g_zDegree = Math.cos(angle) + Math.sin(angle);
  if(g_UPkey == true){ g_yLook -= panup_downDist; } //Up Arrow Key
  if(g_DOWNkey == true) { g_yLook += panup_downDist; } //Down Arrow Key
  if(g_RIGHTkey == true) { //Right Arrow Key
    angle = (angle + Math.PI / 180) % (2 * Math.PI);
    g_xDegree = Math.cos(angle) - Math.sin(angle);
    g_zDegree = Math.cos(angle) + Math.sin(angle);
  }
  if(g_LEFTkey == true){ //Left Arrow Key
    angle = (angle - Math.PI / 180) % (2 * Math.PI);
    g_xDegree = Math.cos(angle) - Math.sin(angle);
    g_zDegree = Math.cos(angle) + Math.sin(angle); 
  }
  if(g_wKey == true){ g_xCord += g_xDegree * forward_backDist; g_zCord += g_zDegree * forward_backDist;}
  if(g_Skey == true){ g_xCord -= g_xDegree * forward_backDist; g_zCord -= g_zDegree * forward_backDist;}
  if(g_Akey == true){ g_xCord += g_zDegree * left_rightDist; g_zCord -= g_xDegree * left_rightDist;}
  if(g_Dkey == true){ g_xCord -= g_zDegree * left_rightDist; g_zCord += g_xDegree * left_rightDist;}
  if(g_SPACEkey == true){ g_yCord += up_downDist; g_yLook += up_downDist;} 
  if(g_Ckey == true){ g_yCord -= up_downDist; g_yLook -= up_downDist;}
}






/*
===============================
VERTEX, COLOR, NORMAL & INDEX DEFINITIONS
===============================
*/

// Sets the definition for a cube
function initCubeVertexBuffers(gl) {
  // Create a cube
  // Size: 1 by 1 by 1
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var vertices = new Float32Array([   
     // Coordinates
     0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,  -0.5,-0.5, 0.5,   0.5,-0.5, 0.5, // v0-v1-v2-v3 front
     0.5, 0.5, 0.5,   0.5,-0.5, 0.5,   0.5,-0.5,-0.5,   0.5, 0.5,-0.5, // v0-v3-v4-v5 right
     0.5, 0.5, 0.5,   0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,  -0.5, 0.5, 0.5, // v0-v5-v6-v1 up
    -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5, // v1-v6-v7-v2 left
    -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5, // v7-v4-v3-v2 down
     0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5  // v4-v7-v6-v5 back
  ]);

  var normals = new Float32Array([    
    // Normal
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ]);


  // Indices of the vertices
  var indices = new Uint8Array([
    // Indices
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
 ]);


  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

// Sets the definition for a prism
function initPrismVertexBuffers(gl){
  // Create a prism
  // Size: 1 by 1 by 1
  //           v4     
  //      v1  /  \
  //     /  \/    \
  //    /   /\     \
  //   /   v3-\-----v5   
  //  v0-------v2
  var vertices = new Float32Array([   
    // Coordinates
   -0.5, -0.5, 0.5,  0.0, 0.5, 0.5,   0.5,-0.5, 0.5,   // v0-v1-v2 front
    0.0, 0.5, 0.5,   0.0, 0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,   // v1-v4-v5-v2 right
   -0.5,-0.5, 0.5,  -0.5,-0.5,-0.5,   0.0, 0.5,-0.5,   0.0, 0.5, 0.5,   // v0-v3-v4-v1 left
    0.5,-0.5, 0.5,   0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5,   // v2-v5-v3-v0 bottom
   -0.5,-0.5,-0.5,   0.0, 0.5,-0.5,   0.5,-0.5,-0.5    // v3-v4-v5 back
 ]);

 var normals = new Float32Array([    
   // Normal
   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   // v0-v1-v2 front
   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 0.0,   // v1-v4-v5-v2 right
  -1.0, 1.0, 0.0,  -1.0, 1.0, 0.0,  -1.0, 1.0, 0.0,  -1.0, 1.0, 0.0,   // v0-v3-v4-v1 left
   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   // v2-v5-v3-v0 bottom
   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   // v3-v4-v5 back
 ]);


 var indices = new Uint8Array([
   // Indices
    0, 1, 2,               // front
    3, 4, 5,   3, 5, 6,    // right
    7, 8, 9,   7, 9,10,    // left
   11,12,13,  11,13,14,    // bottom
   15,16,17                // back
]);


 // Write the vertex property to buffers (coordinates, colors and normals)
 if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
 if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

 // Write the indices to the buffer object
 var indexBuffer = gl.createBuffer();
 if (!indexBuffer) {
   console.log('Failed to create the buffer object');
   return false;
 }

 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
 gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

 return indices.length;
}

// Function initiates an array buffer based on attribute passed
function initArrayBuffer (gl, attribute, data, num, type) {

  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);

  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  // Unbind the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return true;
}





/*
===============================
MATRIX DEFINITIONS (Stacks)
===============================
*/

// Array for storing a matrix
var g_matrixStack = [];

// Function to push a matrix onto the stack
function pushMatrix(m) { 
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}

// Function to pop a matrix off the stack
function popMatrix() { 
  return g_matrixStack.pop();
}





/*
===============================
DRAWING
===============================
*/
function draw(gl, u_ModelMatrix, u_NormalMatrix, u_ViewMatrix, u_ProjMatrix, u_isLighting, u_Color, canvas) {

  // Calculate the view matrix and the projection matrix
  viewMatrix.setLookAt(g_xCord, g_yCord, g_zCord, g_xCord + g_xDegree, g_yLook, g_zCord + g_zDegree, 0, 1, 0);
  projMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
  // Pass the view, and projection matrix to the uniform variable respectively
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Sets default color
  gl.uniform4f(u_Color, 1, 0, 0, 1); 

  // Means lighting will always apply
  gl.uniform1i(u_isLighting, true); // Will apply lighting

  drawBuildingBase(gl, u_ModelMatrix, u_NormalMatrix, u_Color)

  // Set the vertex coordinates and color (for the cube)
  var n = initCubeVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Do translations that apply to all!
  modelMatrix.setTranslate(0, 0, 0);  // Translation (No translation is supported here)
  
  drawBuildingBase(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color)
  drawFloor(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color);
  drawGardenWall(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color);
  drawSoil(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color);
  drawHedges(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color);
  drawTablesChairsLights(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color);
  drawDoors(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color);
  drawWindows(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color);
  drawBeams(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color);
  drawDrains(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color);

  // Set the vertex coordinates and color (for the cube)
  var n = initPrismVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Rotate, and then transldwaate
  modelMatrix.setTranslate(0, 0, 0);  // Translation (No translation is supported here)

  drawBuildingRoof(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color);

  document.getElementById("Position").innerHTML = "Position = (" + g_xCord + ", " + g_yCord + ", " + g_zCord +  ")";
  document.getElementById("Direction").innerHTML = "Direction = (" + g_xCord + g_xDegree + ", " + g_yLook + ", " + g_zCord + g_zDegree +  ")";
}

function drawBuildingBase(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color) { 
  
  gl.uniform4f(u_Color, 256/256, 256/256, 256/256, 1.0);

  // The main building block
  pushMatrix(modelMatrix);
    modelMatrix.scale(20.0, 8.0, 10.0); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  // The smaller building block
  pushMatrix(modelMatrix);
    modelMatrix.translate(15, -2, -1);  // Translation
    modelMatrix.scale(10.0, 4.0, 8.0); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  // Other building block
  pushMatrix(modelMatrix);
    modelMatrix.translate(16, -2, -5);
    modelMatrix.rotate(90, 0, 1, 0);
    modelMatrix.scale(10.0, 4.0, 6.0)
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix(modelMatrix);

}

function drawBuildingRoof(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color){
  gl.uniform4f(u_Color, 51/256, 0/256, 51/256, 1.0);

  // Main roof
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 6.5, 0);
    modelMatrix.rotate(90, 0, 1, 0);
    modelMatrix.scale(10.0, 5.0, 20.0)
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  // Side roof
  pushMatrix(modelMatrix);
    modelMatrix.translate(15, 2, -1); 
    modelMatrix.rotate(90, 0, 1, 0);
    modelMatrix.scale(8.0, 4.0, 10.0); 
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  // Other roof
  pushMatrix(modelMatrix);
    modelMatrix.translate(16, 2, -5.5); 
    modelMatrix.rotate(0, 0, 1, 0);
    modelMatrix.scale(6.0, 4.0, 9.0); 
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
}

// Draws the floor
function drawFloor(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color){
  gl.uniform4f(u_Color, 256/256, 256/256, 64/256, 1.0);
  pushMatrix(modelMatrix);
    modelMatrix.translate(13, -4, 0); 
    modelMatrix.rotate(90, 0, 0, 1); 
    modelMatrix.rotate(90, 0, 1, 0);
    modelMatrix.scale(25.0, 50.0, 0.1); 
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
}

// Draws the floor
function drawGardenWall(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color){
  gl.uniform4f(u_Color, 230/256, 191/256, 131/256, 1.0);

  pushMatrix(modelMatrix);
  modelMatrix.translate(22.0, -4.0, 0.0); 
  modelMatrix.rotate(-90, 0, 1, 0);

  // Exterior Walls
  // Front wall
  pushMatrix(modelMatrix);
    modelMatrix.translate(4.0, 0.5, -5.0); 
    modelMatrix.scale(0.1, 1.0, 15.0); 
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  // Right Wall
  pushMatrix(modelMatrix);
    modelMatrix.translate(-1.0, 0.5, -12.5); 
    modelMatrix.rotate(-90, 0, 1, 0);
    modelMatrix.scale(0.1, 1.0, 10); 
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  // Back Wall
  pushMatrix(modelMatrix);
    modelMatrix.translate(-6.0, 0.5, -5.0); 
    modelMatrix.scale(0.1, 1.0, 15.0); 
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();


  // Interior Walls
  // Front wall
  pushMatrix(modelMatrix);
    modelMatrix.translate(3.0, 0.5, -4.5); 
    modelMatrix.scale(0.1, 1.0, 14.0); 
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  // Right Wall
  pushMatrix(modelMatrix);
    modelMatrix.translate(-1.0, 0.5, -11.5); 
    modelMatrix.rotate(-90, 0, 1, 0);
    modelMatrix.scale(0.1, 1.0, 8.0); 
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  // Back Wall
  pushMatrix(modelMatrix);
    modelMatrix.translate(-5.0, 0.5, -4.5); 
    modelMatrix.scale(0.1, 1.0, 14.0); 
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  modelMatrix = popMatrix();
}

// Draws the soil
function drawSoil(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color){
  gl.uniform4f(u_Color, 109/256, 88/256, 74/256, 1.0);

  pushMatrix(modelMatrix);
  modelMatrix.translate(22.0, -3.5, 0.0); 
  modelMatrix.rotate(-90, 0, 1, 0);

  // Front Soil
  pushMatrix(modelMatrix);
    modelMatrix.translate(3.5, 0.0, -4.75); 
    modelMatrix.scale(1.0, 0.5, 14.0)
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  // Side Soil
  pushMatrix(modelMatrix);
    modelMatrix.translate(-1.0, 0.0, -12.0); 
    modelMatrix.rotate(-90, 0, 1, 0);
    modelMatrix.scale(1.0, 0.5, 10.0)
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
 
  // Back Soil
  pushMatrix(modelMatrix);
    modelMatrix.translate(-5.5, 0.0, -4.75); 
    modelMatrix.scale(1.0, 0.5, 14.0)
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  modelMatrix = popMatrix();
}

function drawHedges(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color){
  gl.uniform4f(u_Color, 107/256, 142/256, 35/256, 1.0);

  pushMatrix(modelMatrix);
  modelMatrix.translate(22.0, -3.0, 0.0); 
  modelMatrix.rotate(-90, 0, 1, 0);

   // Front Hedge
  pushMatrix(modelMatrix);
    modelMatrix.translate(3.5, 0.0, -4.75); 
    modelMatrix.scale(0.6, 0.5, 14.0)
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  // Side Hedge
  pushMatrix(modelMatrix);
    modelMatrix.translate(-1.0, 0.0, -12.0); 
    modelMatrix.rotate(-90, 0, 1, 0);
    modelMatrix.scale(0.6, 0.5, 9.6)
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
 
  // Back HEdge
  pushMatrix(modelMatrix);
    modelMatrix.translate(-5.5, 0.0, -4.75); 
    modelMatrix.scale(0.6, 0.5, 14.0)
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  modelMatrix = popMatrix();
}

function drawTablesChairsLights(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color){
  gl.uniform4f(u_Color, 230/256, 191/256, 131/256, 1.0);

  pushMatrix(modelMatrix);
  modelMatrix.translate(22.0, -3.5, 1.0); 
  modelMatrix.rotate(90, 0, 1, 0); 

  // Front & Back tables
  for(var h = 0; h < 2; h++){
    for(var i = 0; i < 5; i++){
      drawIndividualTable(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color, -0.5 + (5 * h), 0, (2 * i));
    }
  }

  // Front & Back chairs
  for(var h = 0; h < 2; h++){
    for(var i = 0; i < 5; i++){
      drawIndividualChair(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color, -1.25 + (5 * h), 0, (2 * i), false);
      drawIndividualChair(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color, -1.25 + (5 * h), 0, (2 * i), true);
    }
  }

  // Lights on tables
  for(var h = 0; h < 2; h++){
    for(var i = 0; i < 5; i++){
      drawIndividualLight(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color, -0.5 + (5 * h), 0.7, (2 * i), 0, 0, 0, 0, false);
    }
  }

  modelMatrix = popMatrix();
}

function drawIndividualTable(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color, offsetX, offsetY, offsetZ){
  pushMatrix(modelMatrix);
  modelMatrix.translate(offsetX, offsetY, offsetZ);  // Translates to world position
  
  // Draw table legs
  pushMatrix(modelMatrix);
    modelMatrix.translate(0.0, 0, 0.6);
    modelMatrix.rotate(50, 0, 0, 1);
    modelMatrix.scale(1.4, 0.1, 0.1);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
    modelMatrix.translate(0.0, 0, 0.6);
    modelMatrix.rotate(-50, 0, 0, 1);
    modelMatrix.scale(1.4, 0.1, 0.1);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0, -0.6);
    modelMatrix.rotate(50, 0, 0, 1);
    modelMatrix.scale(1.4, 0.1, 0.1);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0, -0.6);
    modelMatrix.rotate(-50, 0, 0, 1);
    modelMatrix.scale(1.4, 0.1, 0.1);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  // Draw Table Seat
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0.6, 0);
    modelMatrix.scale(1.4, 0.1, 1.4);
    modelMatrix.rotate(90, 0, 0, 1);
    modelMatrix.rotate(90, 0, 1, 0);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix()

  modelMatrix = popMatrix();
}

function drawIndividualChair(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color, offsetX, offsetY, offsetZ, rotate){
  pushMatrix(modelMatrix);
  modelMatrix.translate(offsetX, offsetY, offsetZ);

  if(rotate){
    modelMatrix.rotate(180, 0, 1, 0);
    modelMatrix.translate(-1.5, 0, 0);
  }

  // Chair legs
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0, 0.25);
    modelMatrix.rotate(50, 0, 0, 1);
    modelMatrix.scale(1.0, 0.1, 0.1);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0, 0.25);
    modelMatrix.rotate(-50, 0, 0, 1);
    modelMatrix.scale(1.0, 0.1, 0.1);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0, -0.25);
    modelMatrix.rotate(50, 0, 0, 1);
    modelMatrix.scale(1.0, 0.1, 0.1);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0, -0.25);
    modelMatrix.rotate(-50, 0, 0, 1);
    modelMatrix.scale(1.0, 0.1, 0.1);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  // Beams on chair leg
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0, 0);
    modelMatrix.rotate(90, 0, 1, 0);
    modelMatrix.scale(0.6, 0.1, 0.1);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  // Draw Chair Seat
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0.4, 0);
    modelMatrix.scale(0.7, 0.1, 0.7);
    modelMatrix.rotate(90, 0, 0, 1);
    modelMatrix.rotate(90, 0, 1, 0);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix()

  // Draw Chair Back
  pushMatrix(modelMatrix);
    modelMatrix.translate(-0.35, 0.75, 0);
    modelMatrix.rotate(-80, 0, 0, 1);
    modelMatrix.scale(0.7, 0.1, 0.7);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  modelMatrix = popMatrix();
}

function drawIndividualLight(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color, offsetX, offsetY, offsetZ, rotateX, rotateY, rotateZ, rotateAngle, rotate){
  pushMatrix(modelMatrix);
  modelMatrix.translate(offsetX, offsetY, offsetZ);
  
  gl.uniform4f(u_Color, 230/256, 191/256, 131/256, 1.0);
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0, 0);  // Translation
    modelMatrix.scale(0.25, 0.1, 0.25); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  
  gl.uniform4f(u_Color, 256/256, 256/256, 0/256, 1.0);
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0.075, 0);
    modelMatrix.scale(0.1, 0.05, 0.1);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  modelMatrix = popMatrix();
}

function drawDoors(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color){
  // Main Building
  drawIndividualDoor(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color, -2, -2.75, 5, 0, 0, 0, 0, false);
  // Side Building
  drawIndividualDoor(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color, 16.5, -2.75, 3, 0, 0, 0, 0, false);
  drawIndividualDoor(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color, 17.5, -2.75, 3, 1, 1, 1, 0, false);
  drawIndividualDoor(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color, 20, -2.75, 0, 0, 1, 0, 90, true);
  drawIndividualDoor(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color, 20, -2.75, -1, 0, 1, 0, 90, true);
}

function drawIndividualDoor(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color, offsetX, offsetY, offsetZ, rotateX, rotateY, rotateZ, rotateAngle, rotate){
  gl.uniform4f(u_Color, 105/256, 105/256, 105/256, 1.0);
  pushMatrix(modelMatrix);
    modelMatrix.translate(offsetX, offsetY, offsetZ);
    if(rotate){
      modelMatrix.rotate(rotateAngle, rotateX, rotateY, rotateZ)
    }
    modelMatrix.scale(2.0, 4, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
}

function drawWindows(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color){
  //Main Building
  drawIndividualWindow(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color, -8, -2, 5, 0, 0, 0, 0 , false);
  drawIndividualWindow(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color, 1, -2, 5, 0, 0, 0, 0 , false);
  drawIndividualWindow(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color, 6, -2, 5, 0, 0, 0, 0 , false);
  drawIndividualWindow(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color, -8, 2, 5, 0, 0, 0, 0 , false);
  drawIndividualWindow(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color, 1, 2, 5, 0, 0, 0, 0 , false);
  drawIndividualWindow(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color, 6, 2, 5, 0, 0, 0, 0 , false);
  // Side Building
  drawIndividualWindow(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color, 11, -2, 3, 0, 0, 0, 0 , false);
}

function drawIndividualWindow(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color, offsetX, offsetY, offsetZ, rotateX, rotateY, rotateZ, rotateAngle, rotate){
  gl.uniform4f(u_Color, 105/256, 105/256, 105/256, 1.0);
  
  pushMatrix(modelMatrix);
  modelMatrix.translate(offsetX, offsetY, offsetZ);

  // Left Border (TRANSLATIONS BUITL AROUND THIS)
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0, 0);
    modelMatrix.scale(0.2, 2.0, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  // Top Border
  pushMatrix(modelMatrix);
    modelMatrix.translate(1.4, 1.1, 0);
    modelMatrix.rotate(90, 0, 0, 1);
    modelMatrix.scale(0.2, 3.0, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  // Right Border
  pushMatrix(modelMatrix);
    modelMatrix.translate(2.8, 0, 0.0);
    modelMatrix.scale(0.2, 2.0, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  // Bottom Border
  pushMatrix(modelMatrix);
    modelMatrix.translate(1.4, -1.1, 0);
    modelMatrix.rotate(90, 0, 0, 1);
    modelMatrix.scale(0.2, 3.0, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  gl.uniform4f(u_Color, 211/256, 211/256, 211/256, 1.0);

  // Inside bit
  pushMatrix(modelMatrix);
    modelMatrix.translate(1.4, 0, 0);
    modelMatrix.rotate(90, 0, 0, 1);
    modelMatrix.scale(2.1, 2.9, 0.05); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  modelMatrix = popMatrix();
}

function drawBeams(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color){
  gl.uniform4f(u_Color, 193/256, 154/256, 107/256, 1.0);

  // Beam on main building
  pushMatrix(modelMatrix);
    modelMatrix.translate(-0.25, -0.5, 5.125);
    modelMatrix.scale(19.5, 0.5, 0.25); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
}

function drawDrains(gl, u_ModelMatrix, u_NormalMatrix, n, u_Color){
  gl.uniform4f(u_Color, 0/256, 0/256, 0/256, 1.0);

  // Horizontal beam on main building
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 3.9, 5.125);
    modelMatrix.scale(20.0, 0.2, 0.25); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  // Vertical beam on main building
  pushMatrix(modelMatrix);
    modelMatrix.translate(9.75, -1, 5.125);
    modelMatrix.rotate(90, 0, 0, 1);  
    modelMatrix.scale(10.0, 0.2, 0.25); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
}


function drawbox(gl, u_ModelMatrix, u_NormalMatrix, n) {
  pushMatrix(modelMatrix);

    // Pass the model matrix to the uniform variable
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Calculate the normal transformation matrix and pass it to u_NormalMatrix
    g_normalMatrix.setInverseOf(modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);

    // Draw the cube
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

  modelMatrix = popMatrix();
}
