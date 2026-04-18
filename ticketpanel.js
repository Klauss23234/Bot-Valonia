import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js';

import fs from 'fs';

// =========================
// CONFIG
// =========================
const STAFF_ROLE_ID = '1489722616922112245';
const TICKET_CATEGORY = null;

const FILES = {
  stats: './stats.json'
};

if (!fs.existsSync(FILES.stats)) fs.writeFileSync(FILES.stats, '{}');

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8') || '{}');
const write = (p, d) => fs.writeFileSync(p, JSON.stringify(d, null, 2));

// =========================
// STAFF BALANCE SYSTEM
// =========================
function getStaff(stats, guildId, staffIds) {
  let best = staffIds[0];
  let min = Infinity;

  for (const id of staffIds) {
    const count = stats[guildId]?.[id]?.handled || 0;
    if (count < min) {
      min = count;
      best = id;
    }
  }
  return best;
}

// =========================
// COMMAND
// =========================
export default {
  name: 'ticket',

  async execute(message, args) {
    const sub = args[0];

    // =========================
    // SETUP
    // =========================
    if (sub === 'setup') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
        return message.reply('❌ Permission requise.');

      const embed = new EmbedBuilder()
        .setTitle('🎫 Support System')
        .setDescription(
`📩 Ouvrir un ticket
👥 Ajout / retrait membres
🛡️ Staff auto assign
⭐ Review après fermeture
📊 Stats staff

Clique ci-dessous pour commencer.`)
        .setColor('#5865F2')
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('create_ticket')
          .setLabel('📩 Ouvrir un ticket')
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId('ticket_stats')
          .setLabel('📊 Stats')
          .setStyle(ButtonStyle.Secondary)
      );

      await message.channel.send({ embeds: [embed], components: [row] });
      return message.delete().catch(() => {});
    }
  }
};

// =========================
// INTERACTIONS
// =========================
export async function ticketHandler(interaction) {

  const stats = read(FILES.stats);

  // =========================
  // CREATE TICKET
  // =========================
  if (interaction.isButton() && interaction.customId === 'create_ticket') {

    const modal = new ModalBuilder()
      .setCustomId('ticket_form')
      .setTitle('🎫 Ticket');

    const subject = new TextInputBuilder()
      .setCustomId('subject')
      .setLabel('Sujet')
      .setStyle(TextInputStyle.Short);

    const desc = new TextInputBuilder()
      .setCustomId('desc')
      .setLabel('Description')
      .setStyle(TextInputStyle.Paragraph);

    modal.addComponents(
      new ActionRowBuilder().addComponents(subject),
      new ActionRowBuilder().addComponents(desc)
    );

    return interaction.showModal(modal);
  }

  // =========================
  // CREATE CHANNEL
  // =========================
  if (interaction.isModalSubmit() && interaction.customId === 'ticket_form') {

    await interaction.deferReply({ ephemeral: true });

    const subject = interaction.fields.getTextInputValue('subject');
    const desc = interaction.fields.getTextInputValue('desc');

    const staffList = ['STAFF_ID_1', 'STAFF_ID_2']; // change ici
    const staff = getStaff(stats, interaction.guild.id, staffList);

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: TICKET_CATEGORY,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: staff, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
      ]
    });

    const embed = new EmbedBuilder()
      .setTitle('🎫 Ticket ouvert')
      .addFields(
        { name: 'Sujet', value: subject },
        { name: 'Description', value: desc },
        { name: 'Staff', value: `<@${staff}>` }
      )
      .setColor('#5865F2');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('add_member').setLabel('👥 Ajouter').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('remove_member').setLabel('🚫 Retirer').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('claim').setLabel('👋 Claim').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('close').setLabel('🔒 Fermer').setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `<@${interaction.user.id}> <@${staff}>`,
      embeds: [embed],
      components: [row]
    });

    return interaction.editReply({ content: `✅ Ticket créé : ${channel}` });
  }

  // =========================
  // ADD MEMBER
  // =========================
  if (interaction.isButton() && interaction.customId === 'add_member') {
    const modal = new ModalBuilder()
      .setCustomId('add_member_modal')
      .setTitle('Ajouter membre');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('id')
          .setLabel('ID utilisateur')
          .setStyle(TextInputStyle.Short)
      )
    );

    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId === 'add_member_modal') {
    const id = interaction.fields.getTextInputValue('id').replace(/\D/g, '');

    await interaction.channel.permissionOverwrites.edit(id, {
      ViewChannel: true,
      SendMessages: true
    });

    return interaction.reply({ content: '✅ Ajouté', ephemeral: true });
  }

  // =========================
  // REMOVE MEMBER
  // =========================
  if (interaction.isButton() && interaction.customId === 'remove_member') {
    const modal = new ModalBuilder()
      .setCustomId('remove_member_modal')
      .setTitle('Retirer membre');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('id')
          .setLabel('ID utilisateur')
          .setStyle(TextInputStyle.Short)
      )
    );

    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId === 'remove_member_modal') {
    const id = interaction.fields.getTextInputValue('id').replace(/\D/g, '');

    await interaction.channel.permissionOverwrites.delete(id).catch(() => {});

    return interaction.reply({ content: '🚫 Retiré', ephemeral: true });
  }

  // =========================
  // CLAIM
  // =========================
  if (interaction.isButton() && interaction.customId === 'claim') {
    return interaction.reply({
      content: `👋 Pris en charge par ${interaction.user}`,
      allowedMentions: { users: [] }
    });
  }

  // =========================
  // CLOSE + STATS
  // =========================
  if (interaction.isButton() && interaction.customId === 'close') {

    await interaction.reply('🔒 Fermeture...');

    const guildId = interaction.guild.id;

    if (!stats[guildId]) stats[guildId] = {};
    const staffId = interaction.user.id;

    if (!stats[guildId][staffId])
      stats[guildId][staffId] = { handled: 0 };

    stats[guildId][staffId].handled++;
    write(FILES.stats, stats);

    setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
  }

  // =========================
  // STATS
  // =========================
  if (interaction.isButton() && interaction.customId === 'ticket_stats') {

    const guildStats = stats[interaction.guild.id] || {};

    const top = Object.entries(guildStats)
      .sort((a,b) => b[1].handled - a[1].handled)
      .slice(0, 5)
      .map((x,i) => `**${i+1}.** <@${x[0]}> — ${x[1].handled}`)
      .join('\n');

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('📊 Leaderboard')
          .setDescription(top || 'Aucune donnée')
          .setColor('#5865F2')
      ],
      ephemeral: true
    });
  }
}