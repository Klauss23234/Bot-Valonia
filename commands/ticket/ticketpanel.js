import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
} from 'discord.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// =========================
// PATH SAFE (Railway FIX)
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '../../data');

// crée le dossier sans crash
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

const openTicketsPath = path.join(dataPath, 'open-tickets.json');

// crée fichier si existe pas
if (!fs.existsSync(openTicketsPath)) {
  fs.writeFileSync(openTicketsPath, '{}');
}

// utils
const readJSON = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJSON = (p, d) => fs.writeFileSync(p, JSON.stringify(d, null, 2));

// =========================
// CONFIG
// =========================
const STAFF_ROLE_ID = '1470129937196519575';

// =========================
// MESSAGE D'ACCUEIL
// =========================
async function sendWelcome(channel, member) {
  const embed = new EmbedBuilder()
    .setTitle('🎫 Ticket ouvert')
    .setDescription(`Bienvenue ${member}, un staff va te répondre.`)
    .setColor('#5865F2');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('🔒 Fermer')
      .setStyle(ButtonStyle.Danger)
  );

  await channel.send({ embeds: [embed], components: [row] });
}

// =========================
// EXPORT COMMANDE
// =========================
export default {
  name: 'ticket',
  async execute(message, args) {
    if (args[0] === 'setup') {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('create_ticket')
          .setLabel('📩 Ouvrir un ticket')
          .setStyle(ButtonStyle.Primary)
      );

      await message.channel.send({
        content: '🎫 Clique pour ouvrir un ticket',
        components: [row],
      });
    }
  },
};

// =========================
// BOUTONS
// =========================
export async function handleTicketButtons(interaction) {

  // =========================
  // CREATE TICKET
  // =========================
  if (interaction.customId === 'create_ticket') {

    const guild = interaction.guild;
    const member = interaction.member;

    const open = readJSON(openTicketsPath);

    if (open[member.id]) {
      return interaction.reply({
        content: '❌ Tu as déjà un ticket.',
        ephemeral: true,
      });
    }

    const channel = await guild.channels.create({
      name: `ticket-${member.user.username}`,
      type: ChannelType.GuildText,
      topic: member.id,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: member.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
      ],
    });

    open[member.id] = channel.id;
    writeJSON(openTicketsPath, open);

    await sendWelcome(channel, member);

    await interaction.reply({
      content: `✅ Ticket créé : ${channel}`,
      ephemeral: true,
    });
  }

  // =========================
  // CLOSE TICKET
  // =========================
  if (interaction.customId === 'close_ticket') {

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({
        content: '❌ Staff uniquement.',
        ephemeral: true,
      });
    }

    const open = readJSON(openTicketsPath);
    const userId = interaction.channel.topic;

    delete open[userId];
    writeJSON(openTicketsPath, open);

    await interaction.channel.send('🔒 Fermeture du ticket...');

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 3000);
  }
}