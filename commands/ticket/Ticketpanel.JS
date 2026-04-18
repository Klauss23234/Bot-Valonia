import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  AttachmentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import fs from 'fs';

// =====================================================
// ⚙️ CONFIG — MODIFIE CES VALEURS
// =====================================================
const STAFF_ROLE_ID    = '1489722616922112245';       // 👈 ID du rôle staff
const SUPERIOR_ROLE_ID = '1489722614992601228';   // 👈 ID du rôle supérieur (responsable)
const LOG_CHANNEL_ID   = '1489722782802641070';        // 👈 ID du salon de logs/évaluations
const TICKET_CATEGORY  = "1489722720814891152";                   // 👈 ID catégorie (ou null)
// =====================================================

if (!fs.existsSync('./data')) fs.mkdirSync('./data');
const FILES = {
  open:    './data/open-tickets.json',
  ratings: './data/pending-ratings.json',
  reviews: './data/ticket-reviews.json',
  stats:   './data/ticket-stats.json',
};
for (const f of Object.values(FILES)) {
  if (!fs.existsSync(f)) fs.writeFileSync(f, '{}');
}

const readJSON = (p) => {
  try { const c = fs.readFileSync(p, 'utf8').trim(); return c ? JSON.parse(c) : {}; }
  catch { return {}; }
};
const writeJSON = (p, d) => fs.writeFileSync(p, JSON.stringify(d, null, 2));

const creating = new Set();

// ── Log helper ──
async function sendLog(guild, embed, files = []) {
  const ch = guild.channels.cache.get(LOG_CHANNEL_ID);
  if (ch) await ch.send({ embeds: [embed], files }).catch(() => {});
}

// ── Transcription HTML ──
function generateHTML(messages, channelName) {
  const rows = messages.map(m => {
    const time    = new Date(m.createdTimestamp).toLocaleString('fr-FR');
    const content = m.content.replace(/</g, '&lt;').replace(/>/g, '&gt;') || '<i style="color:#72767d">(embed/fichier)</i>';
    return `<div class="msg${m.author.bot ? ' bot' : ''}">
      <img class="av" src="https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png?size=32" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'"/>
      <div><div class="meta"><span class="name">${m.author.tag}</span><span class="time">${time}</span></div>
      <div class="txt">${content}</div></div></div>`;
  }).join('');
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><title>Transcript · ${channelName}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{background:#313338;color:#dcddde;font-family:'Segoe UI',sans-serif;padding:30px;max-width:900px;margin:0 auto}
h1{color:#fff;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid #3f4147;font-size:1.2em}
.msg{display:flex;gap:12px;padding:6px 10px;border-radius:8px;margin-bottom:2px}.msg:hover{background:#2e3035}
.msg.bot .name{color:#5865f2}.av{width:34px;height:34px;border-radius:50%;flex-shrink:0;margin-top:2px}
.meta{display:flex;align-items:baseline;gap:8px;margin-bottom:3px}.name{font-weight:700;color:#fff;font-size:.88em}
.time{font-size:.72em;color:#72767d}.txt{font-size:.92em;line-height:1.5;word-break:break-word}</style>
</head><body><h1>📋 Transcript — #${channelName}</h1>${rows}</body></html>`;
}

// ── Fermeture ticket ──
async function closeTicket(channel, guild, staff) {
  const userId  = channel.topic?.split('|')[0]?.trim() || '0';
  const guildId = guild.id;

  const open = readJSON(FILES.open);
  if (open[guildId]?.[userId]) { delete open[guildId][userId]; writeJSON(FILES.open, open); }

  const fetched    = await channel.messages.fetch({ limit: 100 });
  const msgList    = [...fetched.values()].reverse();
  const attachment = new AttachmentBuilder(
    Buffer.from(generateHTML(msgList, channel.name), 'utf-8'),
    { name: `transcript-${channel.name}.html` }
  );

  await sendLog(guild, new EmbedBuilder()
    .setTitle('🔒 Ticket fermé')
    .setColor('#ED4245')
    .setThumbnail(staff.user.displayAvatarURL())
    .addFields(
      { name: '👤 Utilisateur', value: `<@${userId}>`,        inline: true },
      { name: '🛡️ Fermé par',   value: `${staff}`,            inline: true },
      { name: '📌 Salon',       value: `\`${channel.name}\``, inline: true },
      { name: '💬 Messages',    value: `${msgList.length}`,    inline: true }
    )
    .setFooter({ text: 'Transcription HTML jointe' })
    .setTimestamp()
  , [attachment]);

  // Panel notation
  const evalMsg = await channel.send({
    embeds: [new EmbedBuilder()
      .setTitle('⭐ Évalue ton expérience')
      .setDescription([
        'Merci d\'avoir contacté notre support !',
        '',
        'Comment s\'est passée ton expérience ?',
        'Clique sur une note ci-dessous 👇',
      ].join('\n'))
      .setColor('#FFD700')
      .setFooter({ text: '⏳ Ticket supprimé dans 30s si aucune note' })
      .setTimestamp()
    ],
    components: [new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('rate_1').setLabel('⭐ 1').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('rate_2').setLabel('⭐ 2').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('rate_3').setLabel('⭐ 3').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('rate_4').setLabel('⭐ 4').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('rate_5').setLabel('⭐ 5').setStyle(ButtonStyle.Success),
    )]
  });

  const ratings = readJSON(FILES.ratings);
  ratings[evalMsg.id] = { userId, staffId: staff.id, channelId: channel.id, guildId };
  writeJSON(FILES.ratings, ratings);

  await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false }).catch(() => {});

  setTimeout(async () => {
    const r = readJSON(FILES.ratings);
    if (r[evalMsg.id]) { delete r[evalMsg.id]; writeJSON(FILES.ratings, r); await channel.delete().catch(() => {}); }
  }, 30000);
}

// ==============================================
// 📌 COMMANDE +ticket
// ==============================================
export default {
  name: 'ticket',
  description: 'Système de ticket complet',

  async execute(message, args) {
    const sub = args[0];

    if (sub === 'setup') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
        return message.reply('❌ Permission `ManageChannels` requise.');

      const embed = new EmbedBuilder()
        .setTitle('🎫 Besoin d\'aide ?')
        .setDescription([
          '**Notre équipe de support est là pour toi !**',
          '',
          '╔══════════════════════════╗',
          '║  📩  Ouvre un ticket     ║',
          '║  📝  Explique ta demande ║',
          '║  ⚡  Réponse rapide      ║',
          '╚══════════════════════════╝',
          '',
          '> Clique sur le bouton ci-dessous pour commencer.',
        ].join('\n'))
        .setColor('#5865F2')
        .setThumbnail(message.guild.iconURL({ size: 256 }))
        .setImage('https://i.imgur.com/4M34hi2.png')
        .setFooter({ text: `${message.guild.name} • Support`, iconURL: message.guild.iconURL() })
        .setTimestamp();

      await message.channel.send({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel('📩 Ouvrir un ticket')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎫')
        )]
      });

      return message.delete().catch(() => {});
    }

    if (sub === 'close') {
      if (!message.channel.name.startsWith('ticket-'))
        return message.reply('❌ Utilise cette commande dans un ticket.');
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
        return message.reply('❌ Permission requise.');
      return closeTicket(message.channel, message.guild, message.member);
    }

    if (sub === 'stats') {
      const stats  = readJSON(FILES.stats);
      const target = args[1] ? args[1].replace(/\D/g, '') : message.author.id;
      const data   = stats[message.guild.id]?.[target];
      if (!data) return message.reply('❌ Aucune stat pour cet utilisateur.');
      const full  = Math.round(data.average);
      const stars = '⭐'.repeat(full) + '✩'.repeat(5 - full);
      const mb    = await message.guild.members.fetch(target).catch(() => null);
      return message.reply({ embeds: [new EmbedBuilder()
        .setTitle('📊 Stats Staff')
        .setAuthor(mb ? { name: mb.user.tag, iconURL: mb.user.displayAvatarURL() } : { name: target })
        .setColor('#5865F2')
        .addFields(
          { name: '🎫 Tickets gérés', value: `**${data.handled}**`,            inline: true },
          { name: '⭐ Moyenne',       value: `${stars} **${data.average}/5**`, inline: true },
          { name: '🏆 Total points',  value: `**${data.totalRating}**`,         inline: true }
        ).setTimestamp()
      ]});
    }

    return message.reply('📋 Usage : `+ticket setup | close | stats [id]`');
  }
};

// ==============================================
// 🎛️ GESTION BOUTONS & MODALS
// ==============================================
export async function handleTicketButtons(interaction) {

  // ── Bouton ouvrir ticket → Modal raison ──
  if (interaction.isButton() && interaction.customId === 'create_ticket') {
    const open    = readJSON(FILES.open);
    const guildId = interaction.guild.id;

    if (open[guildId]?.[interaction.member.id]) {
      const existing = interaction.guild.channels.cache.get(open[guildId][interaction.member.id]);
      if (existing)
        return interaction.reply({ content: `❌ Tu as déjà un ticket ouvert : ${existing}`, ephemeral: true });
      delete open[guildId][interaction.member.id];
      writeJSON(FILES.open, open);
    }

    const modal = new ModalBuilder()
      .setCustomId('ticket_reason_modal')
      .setTitle('📝 Ouvrir un ticket');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('raison')
          .setLabel('Quelle est la raison de ton ticket ?')
          .setPlaceholder('Ex: Problème de rôle, question, report d\'un membre...')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMinLength(10)
          .setMaxLength(500)
      )
    );

    await interaction.showModal(modal);
  }

  // ── Soumission raison → Crée le salon ──
  if (interaction.isModalSubmit() && interaction.customId === 'ticket_reason_modal') {
    await interaction.deferReply({ ephemeral: true });

    const member  = interaction.member;
    const guild   = interaction.guild;
    const guildId = guild.id;

    if (creating.has(member.id))
      return interaction.editReply({ content: '⏳ Création en cours...' });
    creating.add(member.id);

    try {
      const raison = interaction.fields.getTextInputValue('raison');

      // Nom du salon basé sur la raison (nettoyé)
      const raisonSlug = raison
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .split(' ')
        .slice(0, 3)
        .join('-');

      const channelName = `ticket-${raisonSlug || member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

      const ticketChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        topic: `${member.id} | ${raison}`,
        parent: TICKET_CATEGORY,
        permissionOverwrites: [
          { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
          {
            id: member.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
            ]
          },
        ]
      });

      const open = readJSON(FILES.open);
      if (!open[guildId]) open[guildId] = {};
      open[guildId][member.id] = ticketChannel.id;
      writeJSON(FILES.open, open);

      // Embed d'accueil
      const welcomeEmbed = new EmbedBuilder()
        .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
        .setTitle('🎫 Ticket ouvert')
        .setDescription([
          `Bienvenue ${member} ! 👋`,
          '',
          '**📋 Résumé de ta demande :**',
          `> ${raison}`,
          '',
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          'Notre équipe va prendre en charge ta demande.',
          'En attendant, tu peux utiliser les boutons ci-dessous.',
        ].join('\n'))
        .setColor('#5865F2')
        .setThumbnail(member.user.displayAvatarURL({ size: 128 }))
        .addFields(
          { name: '👤 Membre',   value: `${member}`,  inline: true },
          { name: '📅 Ouvert le', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setFooter({ text: `ID: ${member.id}` })
        .setTimestamp();

      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('call_staff').setLabel('📞 Appeler le staff').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('call_superior').setLabel('🔺 Appeler un supérieur').setStyle(ButtonStyle.Danger),
      );
      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('add_member_btn').setLabel('➕ Ajouter un membre').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('remove_member_btn').setLabel('➖ Retirer un membre').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('close_ticket_btn').setLabel('🔒 Fermer').setStyle(ButtonStyle.Danger),
      );

      await ticketChannel.send({
        content: `${member} | <@&${STAFF_ROLE_ID}>`,
        embeds: [welcomeEmbed],
        components: [row1, row2]
      });

      await sendLog(guild, new EmbedBuilder()
        .setTitle('🎫 Nouveau ticket')
        .setColor('#57F287')
        .setThumbnail(member.user.displayAvatarURL())
        .addFields(
          { name: '👤 Utilisateur', value: `${member.user.tag} (${member.id})`, inline: true },
          { name: '📌 Salon',       value: `${ticketChannel}`,                  inline: true },
          { name: '📝 Raison',      value: raison,                              inline: false }
        ).setTimestamp()
      );

      await interaction.editReply({ content: `✅ Ton ticket a été créé : ${ticketChannel}` });

    } finally {
      creating.delete(member.id);
    }
  }

  // ── Appeler le staff ──
  if (interaction.isButton() && interaction.customId === 'call_staff') {
    const lastCall = interaction.channel.messages.cache
      .filter(m => m.author.bot && m.content.includes('📞')).last();
    if (lastCall && Date.now() - lastCall.createdTimestamp < 60000)
      return interaction.reply({ content: '⏳ Un appel a déjà été envoyé il y a moins d\'1 minute !', ephemeral: true });

    const userId = interaction.channel.topic?.split('|')[0]?.trim() || '0';
    await interaction.reply({ content: `📞 <@&${STAFF_ROLE_ID}> — <@${userId}> a besoin d'aide dans ce ticket !` });
  }

  // ── Appeler un supérieur ──
  if (interaction.isButton() && interaction.customId === 'call_superior') {
    const lastCall = interaction.channel.messages.cache
      .filter(m => m.author.bot && m.content.includes('🔺')).last();
    if (lastCall && Date.now() - lastCall.createdTimestamp < 120000)
      return interaction.reply({ content: '⏳ Un supérieur a déjà été appelé récemment !', ephemeral: true });

    const userId = interaction.channel.topic?.split('|')[0]?.trim() || '0';
    await interaction.reply({ content: `🔺 <@&${SUPERIOR_ROLE_ID}> — <@${userId}> requiert l'intervention d'un responsable !` });
  }

  // ── Ajouter un membre ──
  if (interaction.isButton() && interaction.customId === 'add_member_btn') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return interaction.reply({ content: '❌ Réservé au staff.', ephemeral: true });

    const modal = new ModalBuilder().setCustomId('add_member_modal').setTitle('➕ Ajouter un membre');
    modal.addComponents(new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('member_id')
        .setLabel('ID Discord de l\'utilisateur')
        .setPlaceholder('Ex: 123456789012345678')
        .setStyle(TextInputStyle.Short)
        .setRequired(true).setMinLength(17).setMaxLength(20)
    ));
    await interaction.showModal(modal);
  }

  // ── Soumission ajout membre ──
  if (interaction.isModalSubmit() && interaction.customId === 'add_member_modal') {
    await interaction.deferReply({ ephemeral: true });
    const rawId = interaction.fields.getTextInputValue('member_id').replace(/\D/g, '');
    let member;
    try { member = await interaction.guild.members.fetch(rawId); }
    catch { return interaction.editReply({ content: '❌ Membre introuvable. Vérifie l\'ID.' }); }

    await interaction.channel.permissionOverwrites.edit(member.id, {
      ViewChannel: true, SendMessages: true, ReadMessageHistory: true
    });
    await interaction.editReply({ content: `✅ **${member.user.tag}** a été ajouté !` });
    await interaction.channel.send({ embeds: [new EmbedBuilder()
      .setDescription(`➕ ${member} a été ajouté au ticket par ${interaction.user}.`)
      .setColor('#57F287').setTimestamp()
    ]});
  }

  // ── Retirer un membre ──
  if (interaction.isButton() && interaction.customId === 'remove_member_btn') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return interaction.reply({ content: '❌ Réservé au staff.', ephemeral: true });

    const modal = new ModalBuilder().setCustomId('remove_member_modal').setTitle('➖ Retirer un membre');
    modal.addComponents(new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('member_id')
        .setLabel('ID Discord de l\'utilisateur')
        .setPlaceholder('Ex: 123456789012345678')
        .setStyle(TextInputStyle.Short)
        .setRequired(true).setMinLength(17).setMaxLength(20)
    ));
    await interaction.showModal(modal);
  }

  // ── Soumission retrait membre ──
  if (interaction.isModalSubmit() && interaction.customId === 'remove_member_modal') {
    await interaction.deferReply({ ephemeral: true });
    const rawId = interaction.fields.getTextInputValue('member_id').replace(/\D/g, '');
    let member;
    try { member = await interaction.guild.members.fetch(rawId); }
    catch { return interaction.editReply({ content: '❌ Membre introuvable. Vérifie l\'ID.' }); }

    await interaction.channel.permissionOverwrites.delete(member.id).catch(() => {});
    await interaction.editReply({ content: `✅ **${member.user.tag}** a été retiré !` });
    await interaction.channel.send({ embeds: [new EmbedBuilder()
      .setDescription(`➖ ${member} a été retiré du ticket par ${interaction.user}.`)
      .setColor('#ED4245').setTimestamp()
    ]});
  }

  // ── Fermer le ticket ──
  if (interaction.isButton() && interaction.customId === 'close_ticket_btn') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return interaction.reply({ content: '❌ Réservé au staff.', ephemeral: true });

    await interaction.deferReply();
    await interaction.editReply({ content: '🔒 Fermeture du ticket en cours...' });
    return closeTicket(interaction.channel, interaction.guild, interaction.member);
  }

  // ── Notation ──
  if (interaction.isButton() && interaction.customId.startsWith('rate_')) {
    const rating     = parseInt(interaction.customId.split('_')[1]);
    const guildId    = interaction.guild.id;
    const ratings    = readJSON(FILES.ratings);
    const ticketInfo = ratings[interaction.message.id];

    if (!ticketInfo)
      return interaction.update({
        embeds: [new EmbedBuilder().setDescription('❌ Session expirée.').setColor('#ED4245')],
        components: []
      });

    const reviews = readJSON(FILES.reviews);
    if (!reviews[guildId]) reviews[guildId] = {};
    reviews[guildId][interaction.message.id] = {
      user: ticketInfo.userId, staff: ticketInfo.staffId, rating, timestamp: Date.now()
    };
    writeJSON(FILES.reviews, reviews);

    const stats = readJSON(FILES.stats);
    if (!stats[guildId]) stats[guildId] = {};
    if (!stats[guildId][ticketInfo.staffId]) stats[guildId][ticketInfo.staffId] = { handled: 0, totalRating: 0, average: 0 };
    const s = stats[guildId][ticketInfo.staffId];
    s.handled++; s.totalRating += rating;
    s.average = parseFloat((s.totalRating / s.handled).toFixed(2));
    writeJSON(FILES.stats, stats);

    // Log évaluation dans le salon configuré
    await sendLog(interaction.guild, new EmbedBuilder()
      .setTitle('📩 Nouvelle évaluation')
      .setColor('#57F287')
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { name: '👤 Membre',   value: `<@${ticketInfo.userId}>`,  inline: true },
        { name: '🛡️ Staff',    value: `<@${ticketInfo.staffId}>`, inline: true },
        { name: '⭐ Note',     value: `${'⭐'.repeat(rating)} **(${rating}/5)**`, inline: false },
        { name: '📌 Ticket',   value: `\`${interaction.channel.name}\``, inline: true },
      )
      .setTimestamp()
    );

    // DM staff
    try {
      const sm = await interaction.guild.members.fetch(ticketInfo.staffId);
      await sm.send({ embeds: [new EmbedBuilder()
        .setTitle('⭐ Nouvelle note reçue !')
        .setDescription(`Tu as reçu **${rating}/5** ${'⭐'.repeat(rating)} pour le ticket \`${interaction.channel.name}\`.\n\nContinue comme ça ! 💪`)
        .setColor('#FFD700').setTimestamp()
      ]});
    } catch {}

    delete ratings[interaction.message.id];
    writeJSON(FILES.ratings, ratings);

    await interaction.update({
      embeds: [new EmbedBuilder()
        .setTitle('✅ Merci pour ton évaluation !')
        .setDescription(`Tu as noté ce ticket **${rating}/5** ${'⭐'.repeat(rating)}\n\nTon avis aide notre équipe à s'améliorer ! 💙\n\n*Ce salon sera supprimé dans 3 secondes...*`)
        .setColor('#57F287').setTimestamp()
      ],
      components: []
    });

    setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
  }
}