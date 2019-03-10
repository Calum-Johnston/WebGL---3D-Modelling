// PerspectiveView_mvp.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +  // Normal
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +  // Transformation matrix of normal
  'uniform vec3 u_LightColor;\n' +  // Light COlour
  'uniform vec3 u_LightDirection;\n' +  // World coordinates (normalised)
  'uniform vec3 u_AmbientLight;\n' +  // Color of an ambient light
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
     // Calculates the position of the vertex
  '  gl_Position = u_MvpMatrix * a_Position;\n' +

     // Recalculate normal with normal matrix and make length 1.0
  '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
     // Dot product of light direction and orientation of surface
  '  float nDotL = max(dot(u_LightDirection, normal), 0.0);\n' +
     // Calculate the color due to diffuse reflection
  '  vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' +
     // Calculate the color due to ambient reflection
  '  vec3 ambient = u_AmbientLight * a_Color.rgb;\n' +
     // Colour to pass to fragment shader (from diffuse and ambient)
  '  v_Color = vec4(diffuse + ambient, a_Color.a);\n' +
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

  // Get the storage locations (from vertex shader)
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  if (!u_MvpMatrix || !u_LightColor || !u_LightDirection 
    || !u_AmbientLight || !u_NormalMatrix) { 
    console.log('Failed to get the storage locations of variables');
    return;
  }

  // Light stuff (CONSTANT)
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0)  //Sets light colour
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2)  //Sets ambient light colour
  var lightDirection = new Vector3([0.5, 3.0, 4.0]); // Sets light direction (in world coordinates)
  lightDirection.normalize(); 
  gl.uniform3fv(u_LightDirection, lightDirection.elements);

  // Defines and sets the Mvp Matrix
  var modelMatrix = new Matrix4();
  var mvpMatrix = new Matrix4();  
  modelMatrix.setTranslate(0, 0, 0);
  modelMatrix.rotate(90, 0, 0, 1);
  mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
  mvpMatrix.multiply(modelMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  // Defines and sets the Normal Matrix
  var normalMatrix = new Matrix4();
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);   // Clear <canvas> through bitwise or;

  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // Draw the triangles

  /*mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
  mvpMatrix.translate(0, 1.5, 0, 1.5);
  mvpMatrix.scale(0.5, 0.5, 0.5);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   */

}

function initVertexBuffers(gl) {
  var vertices = new Float32Array([
    // Vertex coordinates
    1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
    1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
    1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
   -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
   -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
    1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back 
  ]);

  var colors = new Float32Array([
    // Vertex colours
    1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v0-v1-v2-v3 front
    1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v0-v3-v4-v5 right
    1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v0-v5-v6-v1 up
    1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v1-v6-v7-v2 left
    1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v7-v4-v3-v2 down
    1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1　    // v4-v7-v6-v5 back
  ])

  var normals = new Float32Array([
    // Normals
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ])
  
  var indices = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
   12,13,14,  12,14,15,    // left
   16,17,18,  16,18,19,    // down
   20,21,22,  20,22,23     // back
  ])

  // Create a buffer object for vertices, then for colours
  if(!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) return -1;
  if(!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color')) return -1;;
  if(!initArrayBuffer(gl, normals, 3, gl.FLOAT, 'a_Normal')) return -1;

  // Create a buffer object for indicies
  var indexBuffer = gl.createBuffer();
  if(!indexBuffer){
    console.log('Failed to create the buffer object')
  }

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}


function initArrayBuffer(gl, data, num, type, attribute){
  var buffer = gl.createBuffer();
  
  // Write data into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

   // Assign the buffer object to a_Position and enable the assignment
   var a_attribute = gl.getAttribLocation(gl.program, attribute);
   if(a_attribute < 0) {
     console.log('Failed to get the storage location of ' + attribute);
     return -1;
   }
   gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
   gl.enableVertexAttribArray(a_attribute);

   return true;
}