let Piece = require("./piece");

/**
 * Returns a 2D array (8 by 8) with two black pieces at [3, 4] and [4, 3]
 * and two white pieces at [3, 3] and [4, 4]
 */
function _makeGrid () {
  grid = Array.from(new Array(8), () => new Array(8) )
  grid[3][4] = new Piece('black');
  grid[4][3] = new Piece('black');
  grid[3][3] = new Piece('white');
  grid[4][4] = new Piece('white');
  return grid
}

/**
 * Constructs a Board with a starting grid set up.
 */
function Board () {
  this.grid = _makeGrid();
}

Board.DIRS = [
  [ 0,  1], [ 1,  1], [ 1,  0],
  [ 1, -1], [ 0, -1], [-1, -1],
  [-1,  0], [-1,  1]
];

/**
 * Returns the piece at a given [x, y] position,
 * throwing an Error if the position is invalid.
 */
Board.prototype.getPiece = function (pos) {
  this.isValidPos(pos);
  return this.isOccupied ? this.grid[pos[0]][pos[1]] : undefined
};

/**
 * Checks if there are any valid moves for the given color.
 */
Board.prototype.hasMove = function (color) {
  return this.validMoves(color).length > 0
};

/**
 * Checks if the piece at a given position
 * matches a given color.
 */
Board.prototype.isMine = function (pos, color) {
  return this.getPiece(pos) && this.getPiece(pos).color === color
};

/**
 * Checks if a given position has a piece on it.
 */
Board.prototype.isOccupied = function (pos) {
  return this.grid[pos[0]][pos[1]] instanceof Piece
};

/**
 * Checks if both the white player and
 * the black player are out of moves.
 */
Board.prototype.isOver = function () {
  return ["white","black"].every((l) => {return this.validMoves(l).length === 0 });
};

/**
 * Checks if a given position is on the Board.
 */
Board.prototype.isValidPos = function (pos) {
  if (pos.every((el) => {
    return el >= 0 && el < 8;
  })) {
    // throw new Error('invalid move');
    return true
  } else {
    return false
  }
};

/**
 * Recursively follows a direction away from a starting position, adding each
 * piece of the opposite color until hitting another piece of the current color.
 * It then returns an array of all pieces between the starting position and
 * ending position.
 *
 * Returns null if it reaches the end of the board before finding another piece
 * of the same color.
 *
 * Returns null if it hits an empty position.
 *
 * Returns null if no pieces of the opposite color are found.
 */
function _positionsToFlip (board, pos, color, dir, piecesToFlip) {
}

/**
 * Adds a new piece of the given color to the given position, flipping the
 * color of any pieces that are eligible for flipping.
 *
 * Throws an error if the position represents an invalid move.
 */
Board.prototype.placePiece = function (pos, color) {
  if (!this.validMove(pos, color)) { throw new Error("invalid move") }
  this.grid[pos[0]][pos[1]] = new Piece(color);
  let dirsToFlip = this.piecesToFlip[[pos[0], pos[1]]]
  if (dirsToFlip === undefined) { debugger}
  dirsToFlip.forEach( dir => {
    this.walk(dir, (piece) => piece.flip() )
  })
  this.piecesToFlip = {}
};

Board.prototype.piecesToFlip = {}
/**
 * Prints a string representation of the Board to the console.
 */
Board.prototype.print = function () {
  this.grid.forEach((row) => {
    line = ""
    for (piece in row) {
      line = piece === undefined ? " " : line + piece.toString()
    }
    console.log(line);
  });
};

/**
 * Checks that a position is not already occupied and that the color
 * taking the position will result in some pieces of the opposite
 * color being flipped.
 */
Board.prototype.validMove = function (pos, color) {
  let valid = false;
  this.validMoves(color).forEach((l) => {
    if (pos[0] === l[0] && pos[1] === l[1]) { 
      valid = true 
    }
  })
  return valid;
};

/**
 * Produces an array of all valid positions on
 * the Board for a given color.
 */
Board.prototype.validMoves = function (color) {
  
  let presentPieces = []

  this.grid.forEach((row,idx) => {
    row.forEach((el,jdx) => {
      if (el.color === color) { presentPieces.push([idx, jdx]) }
    });
  });
  
  let legalMoves = []

  presentPieces.forEach( (pos) => {
    let that = this;
    let adjacents = Board.DIRS.map( (arr,idx,dirs) => {
      return {
        value: [pos[0] + arr[0], pos[1] + arr[1]],
        dir: dirs[idx],
        color: that.getPiece(presentPieces[0]).color
      }
    }).filter( (pos) => {
      return that.isValidPos(pos.value) 
    }).filter( (pos) => { 
      return that.getPiece(pos.value) && that.getPiece(pos.value).oppColor() === color
    })
    adjacents.forEach( (dir) => {
      let terminus = that.walk(dir)
      if (terminus) { legalMoves.push(terminus) }
    })
  })
  return legalMoves.sort((a,b) => {
    return a[0] - b[0];
  })
};

Board.prototype.walk = function (dir, lambda) {
  if (this.getPiece(dir.value) && (!lambda || this.getPiece(dir.value).oppColor() === dir.color)) {
    // keep walking
    lambda && lambda(this.getPiece(dir.value))

    let newDir = {
      value: dir.value,
      dir: dir.dir,
      color: dir.color
    };

    !lambda && (this.piecesToFlip["midWalk"] ? 
      this.piecesToFlip["midWalk"].push(newDir) : 
      (this.piecesToFlip["midWalk"] = [newDir]));


    dir.value = [dir.value[0] + dir.dir[0], dir.value[1] + dir.dir[1]]
    return this.walk(dir,lambda)
  } else if (this.isValidPos(dir.value)) {
    // found
    if (lambda) { return }
    this.piecesToFlip[dir.value] = this.piecesToFlip["midWalk"]
    this.piecesToFlip["midWalk"] = undefined
    return dir.value
  } else {
    return undefined
  }
}
module.exports = Board;