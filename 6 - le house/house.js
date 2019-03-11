// Computer Graphics Coursework: By Calum Johnston

/*
===============================
SHADERS
===============================
*/

// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +       
  'uniform mat4 u_ModelMatrix;\n' +    // Rotation/translation/scaling information
  'uniform mat4 u_NormalMatrix;\n' +   // Transformation matrix of normal
  'uniform mat4 u_ViewMatrix;\n' +     // Eye point, look up point, up direction
  'uniform mat4 u_ProjMatrix;\n' +     // Sets viewing volume
  'uniform vec3 u_LightColor;\n' +     // Light color
  'uniform vec3 u_LightDirection;\n' + // Light direction
  'uniform vec3 u_AmbientLight;\n' +   // Color of an ambient light
  'varying vec4 v_Color;\n' +
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
  '     vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' +

        // Calculate the color due to ambient reflection
  '     vec3 ambient = u_AmbientLight * a_Color.rgb;\n' +
  
        // Adds surface colors due to diffuse and ambient reflection
  '     v_Color = vec4(diffuse + ambient, a_Color.a);\n' +  '  }\n' +
  '  else\n' +
  '  {\n' +
  '     v_Color = a_Color;\n' +
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

// Key variables for the program
var modelMatrix = new Matrix4(); // The model matrix
var viewMatrix = new Matrix4();  // The view matrix
var projMatrix = new Matrix4();  // The projection matrix
var g_normalMatrix = new Matrix4();  // Coordinate transformation matrix for normals (used for lighting)

var ANGLE_STEP = 3.0;  // The increments of rotation angle (measured in degrees)
var g_xAngle = 0.0;    // The rotation x angle (measured in degrees)
var g_yAngle = 0.0;    // The rotation y angle (measured in degrees)

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
  gl.clearColor(0.0, 0.0, 1.0, 1.0);  // Blue
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

  // Trigger to define whether lighting is used or not
  var u_isLighting = gl.getUniformLocation(gl.program, 'u_isLighting'); 

  // Checks all uniform variables have been retrieved correctly
  if (!u_ModelMatrix || !u_ViewMatrix || !u_NormalMatrix ||
      !u_ProjMatrix || !u_LightColor || !u_LightDirection ||
      !u_isLighting ) { 
    console.log('Failed to Get the storage locations of u_ModelMatrix, u_ViewMatrix, and/or u_ProjMatrix');
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

  // VIEW RELATED STUFF
  // Calculate the view matrix and the projection matrix
  viewMatrix.setLookAt(0, 0, 15, 0, 0, -100, 0, 1, 0);
  projMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  // Pass the view, and projection matrix to the uniform variable respectively
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

  // When a key is pressed 
  document.onkeydown = function(ev){
    keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_isLighting);
  };

  // Draws the initial structure
  draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting);
}





/*
===============================
KEY PRESSING
===============================
*/
function keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_isLighting) {
  switch (ev.keyCode) {
    case 40: // Up arrow key - Positive rotation of model around the y-axis
      g_xAngle = (g_xAngle + ANGLE_STEP) % 360;
      break;
    case 38: // Down arrow key - Negative rotation of model around the y-axis
      g_xAngle = (g_xAngle - ANGLE_STEP) % 360;
      break;
    case 39: // Right arrow key - Positive rotation of model around the y-axis
      g_yAngle = (g_yAngle + ANGLE_STEP) % 360;
      break;
    case 37: // Left arrow key - Negative rotation of model around the y-axis
      g_yAngle = (g_yAngle - ANGLE_STEP) % 360;
      break;
    default: 
      return; // Skip drawing at no effective action
  }

  // Draws the scene
  draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting);
}





/*
===============================
VERTEX, COLOR, NORMAL & INDEX DEFINITIONS
===============================
*/

// Sets the definition for a cube
function initCubeVertexBuffers(gl) {
  // Create a cube
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


  var colors = new Float32Array([    
    // Colors
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
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
  if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
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


 var colors = new Float32Array([    
   // Colors
   1, 0, 0,   1, 0, 0,   1, 0, 0,  // v0-v1-v2 front
   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,   // v1-v4-v5-v2 right
   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,   // v0-v3-v4-v1 left
   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,   // v2-v5-v3-v0 bottom
   1, 0, 0,   1, 0, 0,   1, 0, 0   // v3-v4-v5 back
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
 if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
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



// Sets the definition for the axis
function initAxesVertexBuffers(gl) {

  var verticesColors = new Float32Array([
    // Vertex coordinates and color 
   -20.0,  0.0,   0.0,  1.0,  1.0,  1.0,  // (x, y, z) , (r, g, b)
    20.0,  0.0,   0.0,  1.0,  1.0,  1.0,
    0.0,  20.0,   0.0,  1.0,  1.0,  1.0, 
    0.0, -20.0,   0.0,  1.0,  1.0,  1.0,
    0.0,   0.0, -20.0,  1.0,  1.0,  1.0, 
    0.0,   0.0,  20.0,  1.0,  1.0,  1.0 
  ]);
  var n = 6;

  // Create a buffer object
  var vertexColorBuffer = gl.createBuffer();  
  if (!vertexColorBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  //Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  // Get the storage location of a_Position, assign buffer and enable
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;  // Number of vertices
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
function draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting) {

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniform1i(u_isLighting, false); // Will not apply lighting

  // Set the vertex coordinates and color (for the x, y axes)

  var n = initAxesVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Calculate the view matrix and the projection matrix
  modelMatrix.setTranslate(0, 0, 0);  // No Translation
  // Pass the model matrix to the uniform variable
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Draw x and y axes
  gl.drawArrays(gl.LINES, 0, n);

  gl.uniform1i(u_isLighting, true); // Will apply lighting

  // Set the vertex coordinates and color (for the cube)
  var n = initPrismVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Rotate, and then translate
  modelMatrix.setTranslate(0, 0, 0);  // Translation (No translation is supported here)
  modelMatrix.rotate(g_yAngle, 0, 1, 0); // Rotate along y axis
  modelMatrix.rotate(g_xAngle, 1, 0, 0); // Rotate along x axis
  drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);

  /*
  // Model the chair seat
  pushMatrix(modelMatrix);
    modelMatrix.scale(2.0, 0.5, 2.0); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  // Model the chair back
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 1.25, -0.75);  // Translation
    modelMatrix.scale(2.0, 2.0, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();*/
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
