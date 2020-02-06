const Game = require("../lib/game");
const Piece = require("../lib/piece.js");
const Board = require("../lib/board.js");


const game = new Game();
game.board.placePiece([2,3], "black")
game.play();
