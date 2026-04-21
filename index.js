import {
  Client,
  Partials,
  GatewayIntentBits,
  Collection,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
  PermissionFlagsBits
} from 'discord.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// 🎫 Systèmes externes
import { handleTicketButtons } from './commands/ticket/ticketpanel.js';
import { handleCandidature } from './commands/candidature-staff.js';
import staffhelp from './commands/modération/staffhelp.js';
import conditionsCommand from './commands/dev/Conditions.js';
import staffCommand from './commands/Staff gestion/staff.js';
import { setupAntinuke } from './commands/dev/Antinuke.js';

// 🎵 Musique
import musicPlay, {
  skipCommand,
  stopCommand,
  pauseCommand,
  queueCommand,
  volumeCommand,
  loopCommand,
  nowplayingCommand,
  shuffleCommand,
  removeCommand,
  lyricsCommand,
  handleMusicButtons,
} from './commands/fun/Music.js';

// 🎉 Giveaway
import giveawayCommand, { grerollCommand, gendCommand } from './commands/fun/giveaway.js';

// 🎭 Rôles réaction
import { roleMenuSetup, roleAdd, roleRemove } from './commands/roleReaction.js';

// 💬 Avis
import avisCommand, { handleAvisInteraction } from './commands/avis.js';

// 💡 Suggestions
import suggestionCommand, { handleSuggestionInteraction } from './commands/suggestion.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.User],
});

client.commands = new Collection();

global.antiSpam = false;
const userMessages = new Map();

client.config = {
  prefix: '+',
  ownerId: '1006595866469093396',
};

//
// 👋 WELCOME
//
let welcomeEvent = null;

try {
  const mod = await import('./commands/Fondation/welcome.js');
  welcomeEvent = mod.welcomeEvent;
  console.log('✅ Module welcome chargé');
} catch (err) {
  console.warn('⚠️ welcome.js introuvable → désactivé');
}

if (welcomeEvent) {
  client.on(welcomeEvent.name, (...args) => {
    welcomeEvent.execute(...args, client);
  });
  console.log('📡 Événement welcome activé');
}

//
// 🎭 RÔLES RÉACTION
//
client.once('ready', () => roleMenuSetup.execute(client));
client.on('messageReactionAdd', (...args) => roleAdd.execute(...args));
client.on('messageReactionRemove', (...args) => roleRemove.execute(...args));
console.log('📡 Événement rôles réaction activé');

//
// 📦 LOAD COMMANDS
//
async function loadCommands(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      await loadCommands(fullPath);
    } else if (file.name.endsWith('.js')) {
      try {
        const command = (await import(`file://${fullPath}`)).default;

        if (command?.name && command?.execute) {
          client.commands.set(command.name, command);
          console.log(`✅ Commande : ${command.name}`);
        }
      } catch (err) {
        console.warn(`⚠️ Erreur commande ${file.name}`);
      }
    }
  }
}

const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) await loadCommands(commandsPath);

//
// 🎯 COMMANDES MANUELLES
//
client.commands.set(giveawayCommand.name, giveawayCommand);
client.commands.set(grerollCommand.name, grerollCommand);
client.commands.set(gendCommand.name, gendCommand);

client.commands.set(musicPlay.name, musicPlay);
client.commands.set(skipCommand.name, skipCommand);
client.commands.set(stopCommand.name, stopCommand);
client.commands.set(pauseCommand.name, pauseCommand);
client.commands.set(queueCommand.name, queueCommand);
client.commands.set(volumeCommand.name, volumeCommand);
client.commands.set(loopCommand.name, loopCommand);
client.commands.set(nowplayingCommand.name, nowplayingCommand);
client.commands.set(shuffleCommand.name, shuffleCommand);
client.commands.set(removeCommand.name, removeCommand);
client.commands.set(lyricsCommand.name, lyricsCommand);

client.commands.set(avisCommand.name, avisCommand);
client.commands.set(suggestionCommand.name, suggestionCommand);

//
// 📡 EVENTS AUTOLOAD
//
const eventsPath = path.join(__dirname, 'events');

if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

  for (const file of eventFiles) {
    const event = (await import(`file://${path.join(eventsPath, file)}`)).default;

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }

    console.log(`📡 Event : ${event.name}`);
  }
}

//
// 🔥 INTERACTIONS
//
client.on('interactionCreate', async interaction => {

  if (interaction.customId === 'donner_avis' || interaction.customId === 'modal_avis') {
    try { await handleAvisInteraction(interaction); } catch(e) { console.error(e); }
    return;
  }

  if (['faire_suggestion', 'modal_suggestion', 'vote_pour', 'vote_contre',
       'suggestion_accepter', 'suggestion_encours', 'suggestion_refuser'].includes(interaction.customId)) {
    try { await handleSuggestionInteraction(interaction); } catch(e) { console.error(e); }
    return;
  }

  if (interaction.isModalSubmit()) {
    try { await handleTicketButtons(interaction); } catch {}
    try { await handleCandidature(interaction); } catch {}
    return;
  }

  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith('music_')) {
    try { await handleMusicButtons(interaction); } catch {}
    return;
  }

  try { await handleTicketButtons(interaction); } catch {}
  try { await handleCandidature(interaction); } catch {}

  if (interaction.customId.startsWith('conditions_')) {
    try { await conditionsCommand.handleButton(interaction); } catch {}
  }
});

//
// 💬 MESSAGE
//
client.on('messageCreate', async message => {
  if (!message.guild || message.author.bot) return;

  const prefix = client.config.prefix;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find(cmd => cmd.aliases?.includes(commandName));

  if (!command) return;

  try {
    await command.execute(message, args, client);
  } catch (err) {
    console.error(err);
    message.reply('❌ Erreur commande.');
  }
});

//
// ⚠️ ERREURS
//
process.on('unhandledRejection', console.error);
client.on('error', console.error);

//
// 🚀 LOGIN
//
client.login(process.env.DISCORD_TOKEN);