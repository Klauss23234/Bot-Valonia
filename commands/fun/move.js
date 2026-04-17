import { EmbedBuilder } from 'discord.js';
import fs from 'fs';

const GAMES_FILE = './data/chess-games.json';

function loadGames() {
  return JSON.parse(fs.readFileSync(GAMES_FILE, 'utf-8'));
}

function saveGames(data) {
  fs.writeFileSync(GAMES_FILE, JSON.stringify(data, null, 2));
}

function renderBoard(board) {
  let display = '```\n  A B C D E F G H\n';
  for (let i = 0; i < 8; i++) {
    display += `${8 - i} `;
    for (let j = 0; j < 8; j++) {
      display += board[i][j] + ' ';
    }
    display += `${8 - i}\n`;
  }
  display += '  A B C D E F G H\n```';
  return display;
}

function parsePosition(pos) {
  if (!pos || pos.length !== 2) return null;
  const col = pos[0].toLowerCase().charCodeAt(0) - 97; // a=0, b=1, etc.
  const row = 8 - parseInt(pos[1]); // 8=0, 7=1, etc.
  if (col < 0 || col > 7 || row < 0 || row > 7) return null;
  return { row, col };
}

export default {
  name: 'move',
  description: 'Déplacer une pièce aux échecs',
  aliases: ['m'],

  async execute(message, args, client) {
    const from = args[0];
    const to = args[1];

    if (!from || !to) {
      return message.reply('❌ Usage: `+move e2 e4`\nExemple : déplacer la pièce de E2 vers E4');
    }

    const games = loadGames();
    const gameId = `${message.channel.id}`;
    const game = games[gameId];

    if (!game) {
      return message.reply('❌ Aucune partie en cours ! Utilise `+chess @user` pour commencer.');
    }

    if (game.turn !== message.author.id) {
      return message.reply('❌ Ce n\'est pas ton tour !');
    }

    if (message.author.id !== game.player1 && message.author.id !== game.player2) {
      return message.reply('❌ Tu ne participes pas à cette partie !');
    }

    const fromPos = parsePosition(from);
    const toPos = parsePosition(to);

    if (!fromPos || !toPos) {
      return message.reply('❌ Position invalide ! Utilise le format `a1` à `h8`.');
    }

    const piece = game.board[fromPos.row][fromPos.col];

    // Vérifier qu'il y a une pièce
    if (piece === '⬛' || piece === '⬜') {
      return message.reply('❌ Il n\'y a pas de pièce à cette position !');
    }

    // Vérifier que c'est bien ta pièce (blanc = player1, noir = player2)
    const whitePieces = ['♙', '♖', '♘', '♗', '♕', '♔'];
    const blackPieces = ['♟', '♜', '♞', '♝', '♛', '♚'];

    if (message.author.id === game.player1 && !whitePieces.includes(piece)) {
      return message.reply('❌ Ce n\'est pas ta pièce ! Tu joues les blancs ⚪');
    }

    if (message.author.id === game.player2 && !blackPieces.includes(piece)) {
      return message.reply('❌ Ce n\'est pas ta pièce ! Tu joues les noirs ⚫');
    }

    // Déplacer la pièce (pas de validation de mouvement pour simplifier)
    const targetPiece = game.board[toPos.row][toPos.col];
    
    // Vérifier qu'on ne capture pas sa propre pièce
    if (message.author.id === game.player1 && whitePieces.includes(targetPiece)) {
      return message.reply('❌ Tu ne peux pas capturer ta propre pièce !');
    }
    if (message.author.id === game.player2 && blackPieces.includes(targetPiece)) {
      return message.reply('❌ Tu ne peux pas capturer ta propre pièce !');
    }

    // Effectuer le mouvement
    game.board[toPos.row][toPos.col] = piece;
    
    // Remplacer l'ancienne position par la case vide appropriée
    const isLightSquare = (fromPos.row + fromPos.col) % 2 === 0;
    game.board[fromPos.row][fromPos.col] = isLightSquare ? '⬜' : '⬛';

    game.moves++;
    game.turn = game.turn === game.player1 ? game.player2 : game.player1;

    saveGames(games);

    const nextPlayer = game.turn === game.player1 ? game.player1 : game.player2;

    const embed = new EmbedBuilder()
      .setTitle('♟️ Partie d\'échecs')
      .setDescription(`${renderBoard(game.board)}\n**Coup ${game.moves}:** ${from.toUpperCase()} → ${to.toUpperCase()}\n\nTour de : <@${nextPlayer}>`)
      .setColor('#F4A460')
      .setFooter({ text: 'Utilisez +move e2 e4 pour jouer • +chess resign pour abandonner' });

    return message.reply({ embeds: [embed] });
  }
};