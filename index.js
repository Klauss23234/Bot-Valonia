import {
  Client,
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
import staffCommand from './commands/Staff gestion/staff.js';      // 🛡️ Staff (bouton refresh)
import { setupAntinuke } from './commands/dev/Antinuke.js';        // 🛡️ Antinuke

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ════════════════════════════════════════
// CLIENT
// ════════════════════════════════════════

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
});

client.commands = new Collection();

global.antiSpam = false;
const userMessages = new Map();

// ───────────── RECRUTEMENT ─────────────
let recrutementOuvert = false;

client.config = {
  prefix: '+',
  ownerId: '1006595866469093396',
};

// ════════════════════════════════════════
// LOADER COMMANDES
// ════════════════════════════════════════

async function loadCommands(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      await loadCommands(fullPath);
    } else if (file.name.endsWith('.js')) {
      const command = (await import(`file://${fullPath}`)).default;

      if (command?.name && command?.execute) {
        client.commands.set(command.name, command);
        console.log(`✅ Commande chargée : ${command.name}`);
      } else {
        console.warn(`⚠️ ${file.name} invalide`);
      }
    }
  }
}

const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) await loadCommands(commandsPath);

// 🎉 Enregistrement manuel giveaway (export nommé)
client.commands.set(giveawayCommand.name, giveawayCommand);
client.commands.set(grerollCommand.name,  grerollCommand);
client.commands.set(gendCommand.name,     gendCommand);
console.log(`✅ Commande chargée : ${giveawayCommand.name}`);
console.log(`✅ Commande chargée : ${grerollCommand.name}`);
console.log(`✅ Commande chargée : ${gendCommand.name}`);

// 🎵 Enregistrement manuel musique (exports nommés)
client.commands.set(musicPlay.name,         musicPlay);
client.commands.set(skipCommand.name,       skipCommand);
client.commands.set(stopCommand.name,       stopCommand);
client.commands.set(pauseCommand.name,      pauseCommand);
client.commands.set(queueCommand.name,      queueCommand);
client.commands.set(volumeCommand.name,     volumeCommand);
client.commands.set(loopCommand.name,       loopCommand);
client.commands.set(nowplayingCommand.name, nowplayingCommand);
client.commands.set(shuffleCommand.name,    shuffleCommand);
client.commands.set(removeCommand.name,     removeCommand);
client.commands.set(lyricsCommand.name,     lyricsCommand);
console.log('✅ Commandes musique chargées');

// ════════════════════════════════════════
// LOADER EVENTS
// ════════════════════════════════════════

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

    console.log(`📡 Événement chargé : ${event.name}`);
  }
}

// ════════════════════════════════════════
// INTERACTIONS
// ════════════════════════════════════════

client.on('interactionCreate', async interaction => {

  // ───────────── MODAL SUGGESTION ─────────────
  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'suggestion_modal') {
      const suggestCmd = client.commands.get('suggest-simple');
      const setupCmd = client.commands.get('suggest-setup');
      if (!suggestCmd) return interaction.reply({ content: '❌ Système de suggestions non disponible.', ephemeral: true });

      await interaction.deferReply({ ephemeral: true });

      const title = interaction.fields.getTextInputValue('suggestion_title');
      const description = interaction.fields.getTextInputValue('suggestion_description');

      let suggestionChannel = interaction.channel;
      if (setupCmd) {
        const channelId = setupCmd.getChannel(interaction.guild.id);
        if (channelId) suggestionChannel = interaction.guild.channels.cache.get(channelId) || interaction.channel;
      }

      const allSuggestions = suggestCmd.getAllSuggestions();
      const suggestionId = allSuggestions.size + 1;

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setAuthor({ name: `Suggestion #${suggestionId} - ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTitle(title)
        .setDescription(description)
        .addFields(
          { name: '👤 Auteur', value: `${interaction.user}`, inline: true },
          { name: '📊 Statut', value: '🟡 En attente', inline: true },
          { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
        )
        .setFooter({ text: `ID: ${suggestionId} • Utilise les boutons pour voter !` })
        .setTimestamp();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId(`suggest_upvote_${suggestionId}`).setLabel('0').setEmoji('👍').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(`suggest_downvote_${suggestionId}`).setLabel('0').setEmoji('👎').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId(`suggest_info_${suggestionId}`).setLabel('Infos').setEmoji('ℹ️').setStyle(ButtonStyle.Secondary)
        );

      try {
        const suggestionMsg = await suggestionChannel.send({ embeds: [embed], components: [row] });

        const suggestionData = {
          id: suggestionId,
          messageId: suggestionMsg.id,
          channelId: suggestionChannel.id,
          authorId: interaction.user.id,
          title: title,
          content: `**${title}**\n\n${description}`,
          status: 'pending',
          upvotes: new Set(),
          downvotes: new Set(),
          createdAt: Date.now(),
          staffResponse: null
        };

        allSuggestions.set(suggestionId, suggestionData);

        const confirmEmbed = new EmbedBuilder()
          .setColor('#57F287')
          .setTitle('✅ Suggestion envoyée !')
          .setDescription(`Ta suggestion #${suggestionId} a été publiée avec succès !`)
          .addFields(
            { name: '💡 Titre', value: title, inline: false },
            { name: '📍 Salon', value: `${suggestionChannel}`, inline: true },
            { name: '🆔 ID', value: `#${suggestionId}`, inline: true }
          )
          .setFooter({ text: 'Merci pour ta contribution !' })
          .setTimestamp();

        await interaction.editReply({ embeds: [confirmEmbed] });
      } catch (err) {
        console.error('[SUGGESTION] Error:', err);
        await interaction.editReply({ content: '❌ Une erreur est survenue.' });
      }
    }

    return;
  }

  if (!interaction.isButton()) return;

  // ───────────── 🛡️ BOUTON STAFF REFRESH ─────────────
  if (interaction.customId === 'staff_refresh') {
    try { await staffCommand.handleButton(interaction); } catch (err) { console.error('[STAFF REFRESH ERROR]', err); }
    return;
  }

  // ───────────── 🎵 BOUTONS MUSIQUE ─────────────
  if (interaction.customId.startsWith('music_')) {
    try { await handleMusicButtons(interaction); } catch (err) { console.error('[MUSIC BUTTON ERROR]', err); }
    return;
  }

  // ───────────── PANEL SUGGESTIONS / MODAL ─────────────
  const suggestCmd = client.commands.get('suggest-simple');
  const setupCmd = client.commands.get('suggest-setup');

  switch (interaction.customId) {
    case 'suggestion_submit': {
      const modal = new ModalBuilder()
        .setCustomId('suggestion_modal')
        .setTitle('💡 Soumettre une suggestion');

      const titleInput = new TextInputBuilder()
        .setCustomId('suggestion_title')
        .setLabel('Titre')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: Ajouter un salon gaming')
        .setRequired(true)
        .setMaxLength(100);

      const descriptionInput = new TextInputBuilder()
        .setCustomId('suggestion_description')
        .setLabel('Description')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Explique ta suggestion...')
        .setRequired(true)
        .setMaxLength(1000);

      modal.addComponents(
        new ActionRowBuilder().addComponents(titleInput),
        new ActionRowBuilder().addComponents(descriptionInput)
      );

      return interaction.showModal(modal);
    }

    case 'suggestion_top': {
      if (!suggestCmd) return interaction.reply({ content: '❌ Aucun système de suggestions actif.', ephemeral: true });
      const suggestions = suggestCmd.getAllSuggestions();
      if (suggestions.size === 0) return interaction.reply({ content: 'ℹ️ Pas encore de suggestions.', ephemeral: true });

      const top = [...suggestions.values()].sort((a, b) => b.upvotes.size - a.upvotes.size).slice(0, 5);
      const topEmbed = new EmbedBuilder()
        .setTitle('🏆 Top Suggestions')
        .setColor('#FFD700')
        .setDescription(top.map(s => `#${s.id} • ${s.title} — 👍 ${s.upvotes.size}`).join('\n'))
        .setTimestamp();
      return interaction.reply({ embeds: [topEmbed], ephemeral: true });
    }

    case 'suggestion_rules': {
      const rulesEmbed = new EmbedBuilder()
        .setTitle('📜 Règles des suggestions')
        .setColor('#57F287')
        .setDescription('• Sois clair et précis\n• Pas de spam\n• Les suggestions personnelles sont interdites')
        .setTimestamp();
      return interaction.reply({ embeds: [rulesEmbed], ephemeral: true });
    }
  }

  // ───────────── 📋 BOUTONS SUGGESTIONS (vue liste) ─────────────
  if (interaction.customId === 'suggest_view_pending') {
    if (!suggestCmd) return interaction.reply({ content: '❌ Système non disponible.', ephemeral: true });

    const allSuggestions = Array.from(suggestCmd.getAllSuggestions().values());
    const pending = allSuggestions.filter(s => s.status === 'pending');

    if (pending.length === 0) return interaction.reply({ content: '📋 Aucune suggestion en attente.', ephemeral: true });

    const list = pending.slice(0, 10).map(s =>
      `**#${s.id}** - ${s.title?.substring(0, 50) || s.content.substring(0, 50)}... (👍 ${s.upvotes.size} | 👎 ${s.downvotes.size})`
    ).join('\n');

    const embed = new EmbedBuilder()
      .setColor('#FEE75C')
      .setTitle('🟡 Suggestions en attente')
      .setDescription(list)
      .setFooter({ text: `Total: ${pending.length} suggestion(s)` });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (interaction.customId === 'suggest_view_accepted') {
    if (!suggestCmd) return interaction.reply({ content: '❌ Système non disponible.', ephemeral: true });

    const allSuggestions = Array.from(suggestCmd.getAllSuggestions().values());
    const accepted = allSuggestions.filter(s => s.status === 'accepted');

    if (accepted.length === 0) return interaction.reply({ content: '✅ Aucune suggestion acceptée pour le moment.', ephemeral: true });

    const list = accepted.slice(0, 10).map(s =>
      `**#${s.id}** - ${s.title?.substring(0, 50) || s.content.substring(0, 50)}... (👍 ${s.upvotes.size})`
    ).join('\n');

    const embed = new EmbedBuilder()
      .setColor('#57F287')
      .setTitle('✅ Suggestions acceptées')
      .setDescription(list)
      .setFooter({ text: `Total: ${accepted.length} suggestion(s)` });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (interaction.customId === 'suggest_top') {
    if (!suggestCmd) return interaction.reply({ content: '❌ Système non disponible.', ephemeral: true });

    const allSuggestions = Array.from(suggestCmd.getAllSuggestions().values());

    if (allSuggestions.length === 0) return interaction.reply({ content: '🏆 Aucune suggestion pour le moment.', ephemeral: true });

    const top = allSuggestions
      .sort((a, b) => b.upvotes.size - a.upvotes.size)
      .slice(0, 10)
      .map((s, i) =>
        `**${i + 1}.** #${s.id} - ${s.title?.substring(0, 40) || s.content.substring(0, 40)}... **(👍 ${s.upvotes.size})**`
      ).join('\n');

    const embed = new EmbedBuilder()
      .setColor('#FEE75C')
      .setTitle('🏆 Top Suggestions')
      .setDescription(top)
      .setFooter({ text: 'Classement par nombre de votes positifs' });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // ───────────── GESTION VOTES ─────────────
  if (interaction.customId.startsWith('suggest_upvote_') || interaction.customId.startsWith('suggest_downvote_') || interaction.customId.startsWith('suggest_info_')) {
    if (!suggestCmd) return;

    const parts = interaction.customId.split('_');
    const action = parts[1];
    const suggestionId = parseInt(parts[2]);

    const suggestion = suggestCmd.getSuggestion(suggestionId);
    if (!suggestion) return interaction.reply({ content: '❌ Suggestion introuvable.', ephemeral: true });

    if (action === 'upvote') {
      suggestion.downvotes.delete(interaction.user.id);
      if (suggestion.upvotes.has(interaction.user.id)) suggestion.upvotes.delete(interaction.user.id);
      else suggestion.upvotes.add(interaction.user.id);
    }

    if (action === 'downvote') {
      suggestion.upvotes.delete(interaction.user.id);
      if (suggestion.downvotes.has(interaction.user.id)) suggestion.downvotes.delete(interaction.user.id);
      else suggestion.downvotes.add(interaction.user.id);
    }

    if (action === 'info') {
      const upvotes = suggestion.upvotes.size;
      const downvotes = suggestion.downvotes.size;
      const total = upvotes + downvotes;
      const percentage = total > 0 ? Math.round((upvotes / total) * 100) : 0;
      const statusEmoji = { pending: '🟡 En attente', accepted: '✅ Acceptée', denied: '❌ Refusée', considering: '🤔 En considération' };

      const embed = new EmbedBuilder()
        .setTitle(`ℹ️ Suggestion #${suggestionId}`)
        .setColor('#5865F2')
        .addFields(
          { name: '👤 Auteur', value: `<@${suggestion.authorId}>`, inline: true },
          { name: '📊 Statut', value: statusEmoji[suggestion.status], inline: true },
          { name: '📅 Créée', value: `<t:${Math.floor(suggestion.createdAt / 1000)}:R>`, inline: true },
          { name: '👍 Pour', value: `${suggestion.upvotes.size}`, inline: true },
          { name: '👎 Contre', value: `${suggestion.downvotes.size}`, inline: true },
          { name: '📊 Approbation', value: `${percentage}%`, inline: true }
        )
        .setTimestamp();

      if (suggestion.staffResponse) {
        embed.addFields({ name: '👮 Réponse du staff', value: `Par: <@${suggestion.staffResponse.staffId}>\nRaison: ${suggestion.staffResponse.reason}`, inline: false });
      }

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const upvotes = suggestion.upvotes.size;
    const downvotes = suggestion.downvotes.size;
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId(`suggest_upvote_${suggestionId}`).setLabel(`${upvotes}`).setEmoji('👍').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`suggest_downvote_${suggestionId}`).setLabel(`${downvotes}`).setEmoji('👎').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`suggest_info_${suggestionId}`).setLabel('Infos').setEmoji('ℹ️').setStyle(ButtonStyle.Secondary)
      );

    await interaction.message.edit({ components: [row] });
    await interaction.deferUpdate();
    return;
  }

  // ───────────── 🎉 GIVEAWAY ─────────────
  if (interaction.customId.startsWith('giveaway_join_')) {
    try { await giveawayCommand.handleButton(interaction); } catch (err) { console.error('[GIVEAWAY BUTTON ERROR]', err); }
    return;
  }

  // ───────────── AUTRES BOUTONS (tickets, règles, staff) ─────────────
  try { await handleTicketButtons(interaction); } catch (err) { console.error('[TICKET ERROR]', err); }
  try { await handleCandidature(interaction); } catch (err) { console.error('[CANDIDATURE ERROR]', err); }
  if (interaction.isButton() && interaction.customId.startsWith('conditions_')) {
    try { await conditionsCommand.handleButton(interaction); } catch (err) { console.error('[CONDITIONS ERROR]', err); }
  }

});

// ════════════════════════════════════════
// MESSAGE CREATE
// ════════════════════════════════════════

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

  try { await command.execute(message, args, client); }
  catch (err) { console.error(err); message.reply('❌ Erreur lors de la commande.'); }
});

// ════════════════════════════════════════
// ERREURS
// ════════════════════════════════════════

process.on('unhandledRejection', console.error);
client.on('error', console.error);

// ════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════

client.login(process.env.DISCORD_TOKEN);

// ════════════════════════════════════════
// 🛡️ ANTINUKE — Lancé après connexion
// ════════════════════════════════════════

client.once('ready', () => {
  setupAntinuke(client);
  console.log(`✅ ${client.user.tag} connecté — Antinuke actif.`);
});