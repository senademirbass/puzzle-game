class Piece {
  constructor(x, y, imageData, originalX, originalY) {
    this.x = x;
    this.y = y;
    this.imageData = imageData;
    this.originalX = originalX;
    this.originalY = originalY;
    this.next = null;
    this.prev = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }

  addPiece(piece) {
    if (!this.head) {
      this.head = piece;
      this.tail = piece;
    } else {
      this.tail.next = piece;
      piece.prev = this.tail;
      this.tail = piece;
    }
  }
}

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let image = new Image();
let puzzleSize = 4;
let pieceSize;
let selectedPiece = null;
let mouseX = 0;
let mouseY = 0;
let linkedList = new LinkedList();

// Load image and break it into pieces
function loadImage() {
  let file = document.getElementById('imageInput').files[0];
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function() {
    image.onload = function() {
      // Calculate the puzzle piece size based on the image size and the puzzle size
      pieceSize = Math.floor(Math.min(image.width, image.height) / puzzleSize);
      canvas.width = puzzleSize * pieceSize;
      canvas.height = puzzleSize * pieceSize;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      // Create the puzzle pieces and add them to the linked list
      for (let i = 0; i < puzzleSize; i++) {
        for (let j = 0; j < puzzleSize; j++) {
          let x = j * pieceSize;
          let y = i * pieceSize;
          let imageData = ctx.getImageData(x, y, pieceSize, pieceSize);
          let piece = new Piece(x, y, imageData, x, y);
          linkedList.addPiece(piece);
        }
      }

      drawPieces(linkedList.head);
      canvas.addEventListener('mousedown', onMouseDown);
      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('mouseup', onMouseUp);
    };
    image.src = reader.result;
  };
}

function drawPieces(piece) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let prevPiece = null;
  while (piece) {
    // Parçalar çizilir
    ctx.putImageData(piece.imageData, piece.x, piece.y);
    ctx.strokeRect(piece.x, piece.y, pieceSize, pieceSize);

    prevPiece = piece;
    piece = piece.next;
  }

  // Beyaz alanın boyutunu dinamik olarak hesapla
  let whiteSpaceWidth = canvas.width - (prevPiece.x + pieceSize);
  let whiteSpaceHeight = canvas.height - (prevPiece.y + pieceSize);
  
  // Beyaz alanın boyutu sıfırdan küçük olmamalı
  whiteSpaceWidth = Math.max(0, whiteSpaceWidth);
  whiteSpaceHeight = Math.max(0, whiteSpaceHeight);

  // Ekstra bir adım olarak, son parçadan sonra bir beyaz alan ekleyebiliriz
  // Bu beyaz alan, parçaların sınırlarını kaplamalıdır ve böylece kaybolmalarını engeller.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(prevPiece.x + pieceSize, prevPiece.y + pieceSize, whiteSpaceWidth, whiteSpaceHeight);
}


// Shuffle puzzle pieces
function shuffle() {
  let pieces = [];
  let piece = linkedList.head;
  while (piece) {
    pieces.push(piece);
    piece = piece.next;
  }

  pieces.forEach(function(piece) {
    let randomIndex = Math.floor(Math.random() * pieces.length);
    let temp = piece.imageData;
    piece.imageData = pieces[randomIndex].imageData;
    pieces[randomIndex].imageData = temp;
  });

  // Clear canvas before redrawing shuffled pieces
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  drawPieces(linkedList.head);
}

function onMouseDown(e) {
  let rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  let piece = linkedList.head;
  while (piece) {
    if (mouseX >= piece.x && mouseX < piece.x + pieceSize &&
        mouseY >= piece.y && mouseY < piece.y + pieceSize) {
      selectedPiece = piece;
      break;
    }
    piece = piece.next;
  }
}

function onMouseMove(e) {
  let rect = canvas.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;

  if (selectedPiece) {
    selectedPiece.x = x - pieceSize / 2;
    selectedPiece.y = y - pieceSize / 2;
    drawPieces(linkedList.head);
  }
}

function onMouseUp(e) {
  let rect = canvas.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;

  if (selectedPiece) {
    let piece = linkedList.head;
    while (piece) {
      if (piece !== selectedPiece &&
          x >= piece.x && x < piece.x + pieceSize &&
          y >= piece.y && y < piece.y + pieceSize) {
        // Swap positions of the two pieces
        let tempX = selectedPiece.x;
        let tempY = selectedPiece.y;
        selectedPiece.x = piece.x;
        selectedPiece.y = piece.y;
        piece.x = tempX;
        piece.y = tempY;
  
        // Update linked list connections
        let prevSelectedPiece = selectedPiece.prev;
        let nextSelectedPiece = selectedPiece.next;
        let prevPiece = piece.prev;
        let nextPiece = piece.next;
        let temp = selectedPiece.next;
        selectedPiece.next = piece.next;
        piece.next = temp;
        temp = selectedPiece.prev;
        selectedPiece.prev = piece.prev;
        piece.prev = temp;
        if (linkedList.head === selectedPiece) {
          linkedList.head = piece;
        } else if (linkedList.head === piece) {
          linkedList.head = selectedPiece;
        }
        if (linkedList.tail === selectedPiece) {
          linkedList.tail = piece;
        } else if (linkedList.tail === piece) {
          linkedList.tail = selectedPiece;
        }
        
        drawPieces(linkedList.head);
        break;
      }
      piece = piece.next;
    }
    selectedPiece = null;
  }
}
