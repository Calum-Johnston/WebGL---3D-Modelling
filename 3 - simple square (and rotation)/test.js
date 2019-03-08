// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = a_Position;\n' + //Coordinates
    '  v_Color = a_Color;\n' + 
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +  // Point Color
    '}\n';





function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    /** =========================
        Get Rendering Content   
    ========================= **/
    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }


    /** =========================
        Initialize Shaders   
    ========================= **/
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }

    
    /** =========================
        Set positions of vertices   
    ========================= **/	  
    var n = initVertexBuffers(gl);
    if(n < 0){
      console.log('Failed to set the positions of the vertices');
      return;
    }


    /** =========================
        Colour for cleaing Canvas  
    ========================= **/    
    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);


    /** =========================
        Clear Canvas   
    ========================= **/
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);


    /** =========================
        Draw   
    ========================= **/
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}





function initVertexBuffers(gl){
  
  var n = 4;

  // Defines the vertices position and colour
  var verticesColors = new Float32Array([
    -0.5, 0.5, 0.0, 1.0, 0.0,
    -0.5, -0.5, 1.0, 0.0, 0.0,
    0.5, 0.5, 0.0, 0.0, 1.0,  
    0.5, -0.5, 1.0, 1.0, 0.0,
  ]);

  // Create buffer object
  var vertexBuffer = gl.createBuffer();
  if(!vertexBuffer){
    console.log('Failed to create vertex buffer');
  }

  // Bind buffer object to target (tells webgl what type of data the buffer object cnntains)
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write data into the buffer object (bound by the first parameter)
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if(a_Position < 0){
	  console.log('Failed to get the storage location of a_Position');
  }

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);


  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0){
    console.log('Failed to get the storage location of a_Color');
  }

  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
  gl.enableVertexAttribArray(a_Color);

  return n;
}


