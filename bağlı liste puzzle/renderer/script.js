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
    // Puzzle parçalarını oluşturup ve listeye ekleme
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

class LinkedListt {
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
  const piecePosition = linkedList.head;
  while (piecePosition) {
    if (puzzlePiece.x === piecePosition.data.x && puzzlePiece.y === piecePosition.data.y) {
      return true;
    }
    piecePosition = piecePosition.next;
  }
  return false;
}

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let image = new Image();
let puzzleSize = 4;
let pieceSize;
let selectedPiece = null;
let lastSelectedPiece = null;
let mouseX = 0;
let mouseY = 0;
let linkedList = new LinkedList();
const correctPieces = new LinkedList();


//Resmi yükleme ve parçalara ayırma
function loadImage() {
  let file = document.getElementById('imageInput').files[0];
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function() {
    image.onload = function() {
     // Görüntü boyutuna ve yapboz boyutuna göre yapboz parçası boyutunu hesaplama
      pieceSize = Math.floor(Math.min(image.width, image.height) / puzzleSize);
      canvas.width = puzzleSize * pieceSize;
      canvas.height = puzzleSize * pieceSize;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Yapboz parçalarını oluşturma ve bunları bağlantılı listeye ekleme
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


function drawPieces(piece) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let prevPiece = null;
  while (piece) {
    // Parçaları çizme
    ctx.putImageData(piece.imageData, piece.x, piece.y);
    ctx.strokeRect(piece.x, piece.y, pieceSize, pieceSize);

    prevPiece = piece;
    piece = piece.next;
  }

  // Beyaz alanın boyutunu dinamik olarak hesaplama
  let whiteSpaceWidth = canvas.width - (prevPiece.x + pieceSize);
  let whiteSpaceHeight = canvas.height - (prevPiece.y + pieceSize);

  // Beyaz alanın boyutu sıfırdan küçük olmasın diye
  whiteSpaceWidth = Math.max(0, whiteSpaceWidth);
  whiteSpaceHeight = Math.max(0, whiteSpaceHeight);

  // Ekstra bir adım olarak, son parçadan sonra bir beyaz alan ekleme
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

  // Görüntü veri listesini karıştırma
  for (let i = imageDataList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [imageDataList[i], imageDataList[j]] = [imageDataList[j], imageDataList[i]];
  }

  // Karıştırılmış görüntü verilerini parçalara göre güncelleme
  let i = 0;
  piece = linkedList.head;
  while (piece) {
    piece.imageData = imageDataList[i];
    piece = piece.next;
    i++;
  }

  // Karıştırılmış parçaları yeniden çizmeden önce tuvali temizleme
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPieces(linkedList.head);
}

// Parçaların orijinal sırasını tutan bağlı liste
let originalList = new LinkedList();

// Parçaların sürüklendiği yeni sırayı tutan bağlı liste
let draggedList = new LinkedList();

// Orijinal parça listesini oluşturma
let originalPieces = document.querySelectorAll('#original-list li');
for (let piece of originalPieces) {
  originalList.append(piece.id);
}

// Sürükleyip bırakılan parçaların listesini oluşturma
let draggedPieces = document.querySelector('#dragged-list');

// Sürükleme işlemi başladığında çalışacak olan fonksiyon
function dragStart(event) {
  event.dataTransfer.setData('text', event.target.id);
}

// Sürükleme işlemi bittiğinde çalışacak olan fonksiyon
function dragEnd(event) {
  event.preventDefault();
}

// Sürüklenecek parçaların üzerine gelindiğinde çalışacak olan fonksiyon
function dragOver(event) {
  event.preventDefault();
}

// Parçalar bırakıldığında çalışacak olan fonksiyon
function drop(event) {
  event.preventDefault();
  let pieceId = event.dataTransfer.getData('text');
  let piece = document.getElementById(pieceId);
  draggedPieces.appendChild(piece);
  draggedList.append(piece.id);
}

// Sıralamayı kaydetmek için kullanılacak olan fonksiyon
function saveOrder() {
  // Dragged
  let dragged = null;

  // Parçayı sürükleme işlemi başladığında çağrılır
  function dragStart(event) {
    dragged = event.target;
  }

  // Sürükleme işlemi sırasında her fare hareketinde çağrılır
  function dragOver(event) {
    event.preventDefault();
  }

  // Sürükleme işlemi tamamlandığında çağrılır
  function drop(event) {
    event.preventDefault();
    const dropTarget = event.target;

    // Sürüklendiği yere göre önceki ve sonraki parçaları bulma
    let prev = null;
    let curr = linkedList.head;
    while (curr !== null && curr.element !== dragged.dataset.id) {
      prev = curr;
      curr = curr.next;
    }

    let next = null;
    if (curr !== null) {
      next = curr.next;
    }

    // Sürüklenen parçanın önceki ve sonraki parçaları ile olan bağlantılarını güncelleme
    if (prev !== null) {
      prev.next = next;
    } else {
      linkedList.head = next;
    }

    if (next !== null) {
      next.prev = prev;
    }

    // Sürüklenen parçayı yeni konumuna eklemek
    if (dropTarget.classList.contains('piece')) {
      const dropTargetId = dropTarget.dataset.id;
      let prevDrop = null;
      let currDrop = linkedList.head;
      while (currDrop !== null && currDrop.element !== dropTargetId) {
        prevDrop = currDrop;
        currDrop = currDrop.next;
      }

      if (prevDrop !== null) {
        prevDrop.next = dragged.dataset.id;
      } else {
        linkedList.head = dragged.dataset.id;
      }

      dragged.next = currDrop;
      dragged.prev = prevDrop;
      if (currDrop !== null) {
        currDrop.prev = dragged;
      }

      dropTarget.before(dragged);
    } else {
      linkedList.add(dragged.dataset.id);
      dragged.prev = linkedList.tail.prev;
      dragged.next = null;
      linkedList.tail.next = dragged;
      linkedList.tail = dragged;
      document.getElementById('container').appendChild(dragged);
    }
  }

  // Parçanın sürüklenme işlemi bittiğinde çağrılır
  function dragEnd(event) {
    dragged = null;
  }

  // Tüm parçalara dragstart, dragover, drop ve dragend olayları atanması
  const pieces = document.querySelectorAll('.piece');
  pieces.forEach(piece => {
    piece.addEventListener('dragstart', dragStart);
    piece.addEventListener('dragover', dragOver);
    piece.addEventListener('drop', drop);
    piece.addEventListener('dragend', dragEnd);
  });
}

//Fonksiyonların çalışıp çalışmadığını kontrol etme
function onMouseDown(e) {
  console.log('MouseDown event triggered');
}

function onMouseUp(e) {
  console.log('MouseUp event triggered');
}
function onMouseMove(e) {
  console.log('MouseMove event triggered');
}





