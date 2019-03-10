// PerspectiveView_mvp.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

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

  // Set the vertex coordinates and color (the blue triangle is in the front)
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);

  // Enables hidden surface removal function
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);

  // Get the storage locations 
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix) { 
    console.log('Failed to Get the storage locations of u_MvpMatrix');
    return;
  }

  var modelMatrix = new Matrix4(); // The model matrix
  var viewMatrix = new Matrix4();  // The view matrix
  var projMatrix = new Matrix4();  // The projection matrix
  var mvpMatrix = new Matrix4();  // The Mvp matrix

  // Calculate the model, view and projection matrice values (PERSPECTIVE)
  modelMatrix.setTranslate(0, 0, 0, 0);  // Translate 0.75 units along the positive x-axis
  viewMatrix.setLookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
  projMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
  
  mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);

  // Option 2: Orthogonal projection
  //viewMatrix.setLookAt(10, 10, 20, 0, 0, 0, 0, 1, 0);
  //projMatrix.setOrtho(-3, 3, -3, 3, 3, 100);

  // Pass the model, view, and projection matrix to the uniform variable respectively
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);   // Clear <canvas> through bitwise or;

  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // Draw the triangles
}

function initVertexBuffers(gl) {
  var verticesColors = new Float32Array([
    // Vertex coordinates and color
     1.0, 1.0, 1.0, 1.0, 1.0, 1.0, //vo white
     -1.0, 1.0, 1.0, 1.0, 0.0, 1.0, //v1 magenta
     -1.0, -1.0, 1.0, 1.0, 0.0, 0.0, //v2 red
     1.0, -1.0, 1.0, 1.0, 1.0, 0.0, //v3 yellow
     1.0, -1.0, -1.0, 0.0, 0.0, 1.0, //v4 blue
     1.0, 1.0, -1.0, 0.0, 1.0, 1.0, //v5 cyan
     -1.0, 1.0, -1.0, 0.0, 1.0, 0.0, //v6 green
     -1.0, -1.0, -1.0, 0.0, 0.0, 0.0 //v7 black
  ]);
  
  var indices = new Uint8Array([
    0, 1, 2,  0, 2, 3,  //front
    0, 3, 4,  0, 4, 5,  //right
    0, 5, 6,  0, 6, 1,  //up
    1, 6, 7,  1, 7, 2,  //left
    7, 4, 3,  7, 3, 2,  //down
    4, 7, 6,  4, 6, 5   //back
  ])

  // Create a buffer object
  var vertexColorbuffer = gl.createBuffer();  
  var indexBuffer = gl.createBuffer();
  if (!vertexColorbuffer || !indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Write the vertex information and enable it
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;

  // Assign the buffer object to a_Position and enable the assignment
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);

  // Assign the buffer object to a_Color and enable the assignment
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}