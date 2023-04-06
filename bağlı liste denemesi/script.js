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

class Node {
  constructor(data) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}

class PuzzlePiece {
  constructor(imageUrl, x, y, order) {
    this.x = x;
    this.y = y;
    this.order = order;
    this.node = new Node(this);
  }
}

class Puzzle {
  constructor(imageUrl, numRows, numCols) {
    this.pieces = [];
    this.numRows = numRows;
    this.numCols = numCols;
    this.head = null;
    this.tail = null;
    this.currentOrder = 0;
    // Puzzle parçalarını oluşturun ve listeye ekleyin
    for (let j = 0; j < numCols; j++) {
      const pieceWidth = Math.floor(image.width / numCols);
      const pieceHeight = Math.floor(image.height / numRows);
      const x = j * pieceWidth;
      const y = i * pieceHeight;
      const pieceImage = document.createElement('canvas');
      pieceImage.width = pieceWidth;
      pieceImage.height = pieceHeight;
      const pieceImageCtx = pieceImage.getContext('2d');
      pieceImageCtx.drawImage(image, x, y, pieceWidth, pieceHeight, 0, 0, pieceWidth, pieceHeight);
      const piece = new PuzzlePiece(x, y, pieceImage.toDataURL());
      addPieceToList(piece);
    }
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

function addPieceToList(piece) {
  if (!head) {
    head = piece;
    tail = piece;
  } else {
    tail.next = piece;
    piece.prev = tail;
    tail = piece;
  }
}

function isCorrect(puzzlePiece) {
  const piecePosition = puzzlePiece.piece.position;
  return puzzlePiece.x === piecePosition.x && puzzlePiece.y === piecePosition.y;
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
const correctPieces = new LinkedList();


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
      canvas.addEventListener('mouseup', onMouseUp);
    };
    image.src = reader.result;
  };
}

function drawPieces(headPiece) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let piece = headPiece;
  let prevPiece = null;
  while (piece) {
    // Parçanın adresini console'a yazdır
    console.log(piece);
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


function shuffle() {
  let imageDataList = [];
  let piece = linkedList.head;
  while (piece) {
    imageDataList.push(piece.imageData);
    piece = piece.next;
  }

  // Shuffle image data list
  for (let i = imageDataList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [imageDataList[i], imageDataList[j]] = [imageDataList[j], imageDataList[i]];
  }

  // Update shuffled image data to pieces
  let i = 0;
  piece = linkedList.head;
  while (piece) {
    piece.imageData = imageDataList[i];
    piece = piece.next;
    i++;
  }

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
    piece = piece.next || piece;
  }
}

function onMouseUp(e) {
  const x = e.pageX - canvas.offsetLeft;
  const y = e.pageY - canvas.offsetTop;

  // İlk seçilen parçayı bul
  let piece1 = linkedList.head;
  while (piece1) {
    if (selectedPiece === piece1) {
      break;
    }
    piece1 = piece1.next || piece1;
  }

  // İkinci seçilen parçayı bul
  let piece2 = linkedList.head;
  while (piece2) {
    if (x >= piece2.x && x < piece2.x + pieceSize &&
        y >= piece2.y && y < piece2.y + pieceSize &&
        selectedPiece !== piece2) {

      // İkinci seçilen parça aynı mı?
      if (lastSelectedPiece === piece2) {
        selectedPiece = null;
        break;
      }

      // İki parçanın yerini değiştir
      const tempX = piece2.x;
      const tempY = piece2.y;
      piece2.x = selectedPiece.x;
      piece2.y = selectedPiece.y;
      selectedPiece.x = tempX;
      selectedPiece.y = tempY;
      
      // Seçilen parçaları sıfırla
      selectedPiece = null;
      lastSelectedPiece = null;
      break;
    }
    piece2 = piece2.next || piece2;
  }

  // Parça seçildi mi?
  if (piece1 && !selectedPiece) {
    selectedPiece = piece1;
    lastSelectedPiece = selectedPiece;
  }

  drawPieces(linkedList.head);
}

canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);


function onMouseDown(e) {
  console.log('MouseDown event triggered');
}

function onMouseUp(e) {
  console.log('MouseUp event triggered');
}
