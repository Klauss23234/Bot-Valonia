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
} from 'discord.js';
import fs from 'fs';

// =========================
// CONFIG — MODIFIE ICI
// =========================
const STAFF_ROLE_ID    = '1489722616922112245';  // 👈 ID du rôle staff
const TICKET_CATEGORY  = null;                  // 👈 ID catégorie (ou null)
const LOG_CHANNEL      = 'ticket-logs';         // 👈 Nom du salon de logs

// =========================
// INIT JSON
// =========================
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
  try {
    const c = fs.readFileSync(p, 'utf8').trim();
    return c ? JSON.parse(c) : {};
  } catch { return {}; }
};
const writeJSON = (p, d) => fs.writeFileSync(p, JSON.stringify(d, null, 2));

const creatingTicket = new Set();

// =========================
// HELPERS
// =========================
async function sendLog(guild, embed, files = []) {
  const ch = guild.channels.cache.find(c => c.name === LOG_CHANNEL);
  if (ch) await ch.send({ embeds: [embed], files }).catch(() => {});
}

function generateHTML(messages, channelName) {
  const rows = messages.map(m => {
    const time    = new Date(m.createdTimestamp).toLocaleString('fr-FR');
    const content = m.content.replace(/</g, '&lt;').replace(/>/g, '&gt;') || '<i style="color:#72767d">(embed/fichier)</i>';
    return `
      <div class="msg ${m.author.bot ? 'bot' : ''}">
        <img class="av" src="https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png?size=32" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'"/>
        <div><div class="meta"><span class="name">${m.author.tag}</span><span class="time">${time}</span></div>
        <div class="txt">${content}</div></div>
      </div>`;
  }).join('');

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<title>Transcript · ${channelName}</title><style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#313338;color:#dcddde;font-family:'Segoe UI',sans-serif;padding:30px;max-width:900px;margin:0 auto}
h1{color:#fff;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid #3f4147;font-size:1.2em}
.msg{display:flex;gap:12px;padding:6px 10px;border-radius:8px;margin-bottom:2px}
.msg:hover{background:#2e3035}.msg.bot .name{color:#5865f2}
.av{width:34px;height:34px;border-radius:50%;flex-shrink:0;margin-top:2px}
.meta{display:flex;align-items:baseline;gap:8px;margin-bottom:3px}
.name{font-weight:700;color:#fff;font-size:.88em}
.time{font-size:.72em;color:#72767d}
.txt{font-size:.92em;line-height:1.5;word-break:break-word}
</style></head><body>
<h1>📋 Transcript — #${channelName}</h1>${rows}
</body></html>`;
}

// =========================
// FERMETURE TICKET
// =========================
async function closeTicket(channel, guild, staff) {
  const userId  = channel.topic || '0';
  const guildId = guild.id;

  // Retire des tickets ouverts
  const open = readJSON(FILES.open);
  if (open[guildId]?.[userId]) {
    delete open[guildId][userId];
    writeJSON(FILES.open, open);
  }

  // Transcription HTML
  const fetched    = await channel.messages.fetch({ limit: 100 });
  const msgList    = [...fetched.values()].reverse();
  const attachment = new AttachmentBuilder(
    Buffer.from(generateHTML(msgList, channel.name), 'utf-8'),
    { name: `transcript-${channel.name}.html` }
  );

  // Log fermeture
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
      .setDescription('Merci d\'avoir contacté notre support !\nNote-nous de 1 à 5 étoiles 👇')
      .setColor('#FFD700')
      .setFooter({ text: '⏳ Ticket supprimé dans 30s si aucun avis' })
      .setTimestamp()
    ],
    components: [new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('rate_1').setLabel('⭐ 1').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('rate_2').setLabel('⭐ 2').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('rate_3').setLabel('⭐ 3').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('rate_4').setLabel('⭐ 4').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('rate_5').setLabel('⭐ 5').setStyle(ButtonStyle.Success)
    )]
  });

  // Sauvegarde infos notation (persistant)
  const ratings = readJSON(FILES.ratings);
  ratings[evalMsg.id] = { userId, staffId: staff.id, channelId: channel.id, guildId };
  writeJSON(FILES.ratings, ratings);

  // Lock le salon
  await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false }).catch(() => {});

  // Suppression auto 30s
  setTimeout(async () => {
    const r = readJSON(FILES.ratings);
    if (r[evalMsg.id]) {
      delete r[evalMsg.id];
      writeJSON(FILES.ratings, r);
      await channel.delete().catch(() => {});
    }
  }, 30000);
}

// =========================
// COMMANDE +ticket
// =========================
export default {
  name: 'ticket',
  description: 'Système de ticket complet',

  async execute(message, args) {
    const sub = args[0];

    // ── SETUP ──
    if (sub === 'setup') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
        return message.reply('❌ Permission `ManageChannels` requise.');

      await message.channel.send({
        embeds: [new EmbedBuilder()
          .setTitle('🎫 Support')
          .setDescription([
            '**Besoin d\'aide ? Notre équipe est là !**', '',
            '> 📝 Formulaire de demande',
            '> 🎫 Salon privé créé instantanément',
            '> 📞 Appel staff en un clic',
            '> 🔒 Fermeture + transcription HTML',
            '> ⭐ Système d\'avis après chaque ticket', '',
            '*Clique ci-dessous pour ouvrir un ticket.*'
          ].join('\n'))
          .setColor('#5865F2')
          .setThumbnail(message.guild.iconURL({ size: 256 }))
          .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
          .setTimestamp()
        ],
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel('📩 Ouvrir un ticket')
            .setStyle(ButtonStyle.Primary)
        )]
      });

      return message.delete().catch(() => {});
    }

    // ── CLOSE ──
    if (sub === 'close') {
      if (!message.channel.name.startsWith('ticket-'))
        return message.reply('❌ Utilise cette commande dans un ticket.');
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
        return message.reply('❌ Permission `ManageChannels` requise.');
      return closeTicket(message.channel, message.guild, message.member);
    }

    // ── STATS ──
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
          { name: '🎫 Tickets',      value: `**${data.handled}**`,             inline: true },
          { name: '⭐ Moyenne',      value: `${stars} **${data.average}/5**`,  inline: true },
          { name: '🏆 Total points', value: `**${data.totalRating}**`,          inline: true }
        ).setTimestamp()
      ]});
    }

    return message.reply('📋 Usage : `+ticket setup | close | stats [id]`');
  }
};

// =========================
// GESTION BOUTONS & MODALS
// =========================
export async function handleTicketButtons(interaction) {

  // ── Ouvrir un ticket → Formulaire ──
  if (interaction.isButton() && interaction.customId === 'create_ticket') {
    const open    = readJSON(FILES.open);
    const guildId = interaction.guild.id;

    // Anti-doublon avant le modal
    if (open[guildId]?.[interaction.member.id]) {
      const existing = interaction.guild.channels.cache.get(open[guildId][interaction.member.id]);
      if (existing)
        return interaction.reply({ content: `❌ Tu as déjà un ticket ouvert : ${existing}`, ephemeral: true });
      delete open[guildId][interaction.member.id];
      writeJSON(FILES.open, open);
    }

    // Modal formulaire
    const modal = new ModalBuilder().setCustomId('ticket_form').setTitle('📝 Ouvrir un ticket');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('q_sujet')
          .setLabel('Sujet de ta demande').setPlaceholder('Ex: Problème de rôle, report...')
          .setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(100)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('q_description')
          .setLabel('Décris ton problème en détail').setPlaceholder('Explique la situation...')
          .setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('q_urgence')
          .setLabel('Niveau d\'urgence').setPlaceholder('faible / moyen / élevé')
          .setStyle(TextInputStyle.Short).setRequired(false).setMaxLength(20)
      ),
    );

    await interaction.showModal(modal);
  }

  // ── Soumission formulaire → Crée le salon ──
  if (interaction.isModalSubmit() && interaction.customId === 'ticket_form') {
    await interaction.deferReply({ ephemeral: true });

    const member  = interaction.member;
    const guild   = interaction.guild;
    const guildId = guild.id;

    if (creatingTicket.has(member.id))
      return interaction.editReply({ content: '⏳ Création en cours...' });
    creatingTicket.add(member.id);

    try {
      const sujet       = interaction.fields.getTextInputValue('q_sujet');
      const description = interaction.fields.getTextInputValue('q_description');
      const urgence     = interaction.fields.getTextInputValue('q_urgence') || 'Non renseigné';

      const ticketChannel = await guild.channels.create({
        name: `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        type: ChannelType.GuildText,
        topic: member.id,
        parent: TICKET_CATEGORY,
        permissionOverwrites: [
          { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: member.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
        ]
      });

      const open = readJSON(FILES.open);
      if (!open[guildId]) open[guildId] = {};
      open[guildId][member.id] = ticketChannel.id;
      writeJSON(FILES.open, open);

      // Embed récap dans le ticket
      const welcomeEmbed = new EmbedBuilder()
        .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
        .setTitle('🎫 Nouveau ticket')
        .setColor('#5865F2')
        .setThumbnail(member.user.displayAvatarURL({ size: 128 }))
        .addFields(
          { name: '📝 Sujet',       value: sujet,       inline: false },
          { name: '📄 Description', value: description, inline: false },
          { name: '🚨 Urgence',     value: urgence,     inline: true  },
        )
        .setFooter({ text: `Ticket de ${member.user.tag}` })
        .setTimestamp();

      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('call_staff').setLabel('📞 Appeler un staff').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('claim_ticket').setLabel('👋 Claim').setStyle(ButtonStyle.Success)
      );
      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('add_member_btn').setLabel('👥 Ajouter un membre').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('close_ticket_btn').setLabel('🔒 Fermer').setStyle(ButtonStyle.Danger)
      );

      await ticketChannel.send({ content: `${member} | <@&${STAFF_ROLE_ID}>`, embeds: [welcomeEmbed], components: [row1, row2] });

      await sendLog(guild, new EmbedBuilder()
        .setTitle('🎫 Ticket ouvert').setColor('#57F287')
        .setThumbnail(member.user.displayAvatarURL())
        .addFields(
          { name: '👤 Utilisateur', value: `${member.user.tag} (${member.id})`, inline: true },
          { name: '📌 Salon',       value: `${ticketChannel}`,                  inline: true },
          { name: '📝 Sujet',       value: sujet,                               inline: false }
        ).setTimestamp()
      );

      await interaction.editReply({ content: `✅ Ticket créé : ${ticketChannel}` });
    } finally {
      creatingTicket.delete(member.id);
    }
  }

  // ── Appeler un staff ──
  if (interaction.isButton() && interaction.customId === 'call_staff') {
    const lastCall = interaction.channel.messages.cache
      .filter(m => m.author.bot && m.content.includes('📞')).last();

    if (lastCall && Date.now() - lastCall.createdTimestamp < 60000)
      return interaction.reply({ content: '⏳ Un appel a déjà été envoyé il y a moins d\'1 minute !', ephemeral: true });

    await interaction.reply({ content: `📞 <@&${STAFF_ROLE_ID}> — <@${interaction.channel.topic}> a besoin d'aide !` });
  }

  // ── Claim ──
  if (interaction.isButton() && interaction.customId === 'claim_ticket') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return interaction.reply({ content: '❌ Réservé au staff.', ephemeral: true });

    await interaction.reply({ embeds: [new EmbedBuilder()
      .setDescription(`👋 **${interaction.user.tag}** a pris en charge ce ticket !`)
      .setColor('#57F287').setTimestamp()
    ]});

    await sendLog(interaction.guild, new EmbedBuilder()
      .setTitle('👋 Ticket claim').setColor('#FEE75C')
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { name: '🛡️ Staff', value: interaction.user.tag,             inline: true },
        { name: '📌 Salon', value: `\`${interaction.channel.name}\``, inline: true }
      ).setTimestamp()
    );
  }

  // ── Ajouter un membre ──
  if (interaction.isButton() && interaction.customId === 'add_member_btn') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return interaction.reply({ content: '❌ Réservé au staff.', ephemeral: true });

    const modal = new ModalBuilder().setCustomId('add_member_modal').setTitle('👥 Ajouter un membre');
    modal.addComponents(new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('member_id')
        .setLabel('ID de l\'utilisateur').setPlaceholder('Ex: 123456789012345678')
        .setStyle(TextInputStyle.Short).setRequired(true).setMinLength(17).setMaxLength(20)
    ));
    await interaction.showModal(modal);
  }

  // ── Soumission ajout membre ──
  if (interaction.isModalSubmit() && interaction.customId === 'add_member_modal') {
    await interaction.deferReply({ ephemeral: true });
    const rawId = interaction.fields.getTextInputValue('member_id').replace(/\D/g, '');
    let member;
    try { member = await interaction.guild.members.fetch(rawId); }
    catch { return interaction.editReply({ content: '❌ Membre introuvable.' }); }

    await interaction.channel.permissionOverwrites.edit(member.id, {
      ViewChannel: true, SendMessages: true, ReadMessageHistory: true
    });
    await interaction.editReply({ content: `✅ **${member.user.tag}** ajouté !` });
    await interaction.channel.send({ embeds: [new EmbedBuilder()
      .setDescription(`👥 ${member} a été ajouté par ${interaction.user}.`)
      .setColor('#5865F2').setTimestamp()
    ]});
  }

  // ── Fermer ──
  if (interaction.isButton() && interaction.customId === 'close_ticket_btn') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return interaction.reply({ content: '❌ Réservé au staff.', ephemeral: true });

    await interaction.deferReply();
    await interaction.editReply({ content: '🔒 Fermeture en cours...' });
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

    // Sauvegarde avis
    const reviews = readJSON(FILES.reviews);
    if (!reviews[guildId]) reviews[guildId] = {};
    reviews[guildId][interaction.message.id] = { user: ticketInfo.userId, staff: ticketInfo.staffId, rating, timestamp: Date.now() };
    writeJSON(FILES.reviews, reviews);

    // Stats staff
    const stats = readJSON(FILES.stats);
    if (!stats[guildId]) stats[guildId] = {};
    if (!stats[guildId][ticketInfo.staffId]) stats[guildId][ticketInfo.staffId] = { handled: 0, totalRating: 0, average: 0 };
    const s = stats[guildId][ticketInfo.staffId];
    s.handled++;
    s.totalRating += rating;
    s.average = parseFloat((s.totalRating / s.handled).toFixed(2));
    writeJSON(FILES.stats, stats);

    // Log
    await sendLog(interaction.guild, new EmbedBuilder()
      .setTitle('📩 Avis reçu').setColor('#57F287')
      .addFields(
        { name: '👤 Utilisateur', value: `<@${ticketInfo.userId}>`,  inline: true },
        { name: '🛡️ Staff',       value: `<@${ticketInfo.staffId}>`, inline: true },
        { name: '⭐ Note',        value: `${'⭐'.repeat(rating)} **(${rating}/5)**` }
      ).setTimestamp()
    );

    // DM staff
    try {
      const sm = await interaction.guild.members.fetch(ticketInfo.staffId);
      await sm.send({ embeds: [new EmbedBuilder()
        .setTitle('⭐ Nouvelle note !').setColor('#FFD700')
        .setDescription(`**${rating}/5** ${'⭐'.repeat(rating)} pour \`${interaction.channel.name}\` 💪`)
        .setTimestamp()
      ]});
    } catch {}

    delete ratings[interaction.message.id];
    writeJSON(FILES.ratings, ratings);

    await interaction.update({
      embeds: [new EmbedBuilder()
        .setTitle('✅ Avis enregistré !')
        .setDescription(`**${rating}/5** ${'⭐'.repeat(rating)}\nMerci pour ton retour ! 💙\n\n*Suppression dans 3 secondes...*`)
        .setColor('#57F287').setTimestamp()
      ],
      components: []
    });

    setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
  }
}