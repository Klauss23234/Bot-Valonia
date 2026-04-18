import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  WebhookClient,
} from 'discord.js';
import fs from 'fs';

// =========================
// CONFIG — MODIFIE ICI
// =========================
const WEBHOOK_URL   = 'https://discord.com/api/webhooks/1476779652424138966/jlHQ-kJy_Gpld818tXPBYgO2YnOOehGws5kb8CcwXTaaZGxwfFg1Hkq3ikvm_GXpJ4Qt'; // 👈 Remplace par ton nouveau webhook !
const COOLDOWN_JOURS = 1;

// =========================
// INIT JSON
// =========================
if (!fs.existsSync('./data')) fs.mkdirSync('./data');
if (!fs.existsSync('./data/candidatures.json')) fs.writeFileSync('./data/candidatures.json', '{}');

const readJSON = (p) => {
  try {
    const content = fs.readFileSync(p, 'utf8').trim();
    return content ? JSON.parse(content) : {};
  } catch { return {}; }
};
const writeJSON = (p, d) => fs.writeFileSync(p, JSON.stringify(d, null, 2));

const webhookClient = new WebhookClient({ url: WEBHOOK_URL });

// =========================
// COMMANDE +recrutement
// =========================
export default {
  name: 'recrutement',
  description: 'Envoie le panel de candidature staff',

  async execute(message) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return message.reply('❌ Permission `ManageChannels` requise.');

    const embed = new EmbedBuilder()
      .setTitle('🛡️ Candidature Staff')
      .setDescription([
        '**Tu veux rejoindre l\'équipe ? On recrute !**',
        '',
        '> 📝 Remplis le formulaire de candidature',
        '> ⏳ Notre équipe examinera ta demande',
        '> ✅ Tu seras contacté par un responsable',
        '',
        '*Clique sur le bouton ci-dessous pour postuler.*',
      ].join('\n'))
      .setColor('#5865F2')
      .setThumbnail(message.guild.iconURL({ size: 256 }))
      .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
      .setTimestamp();

    await message.channel.send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('apply_staff')
          .setLabel('📩 Postuler')
          .setStyle(ButtonStyle.Primary)
      )]
    });

    return message.delete().catch(() => {});
  }
};

// =========================
// GESTION BOUTONS & MODALS
// =========================
export async function handleCandidature(interaction) {

  // ── Bouton Postuler ──
  if (interaction.isButton() && interaction.customId === 'apply_staff') {
    const data     = readJSON('./data/candidatures.json');
    const guildId  = interaction.guild.id;
    const userId   = interaction.user.id;
    const last     = data[guildId]?.[userId]?.lastApplied;
    const cooldown = COOLDOWN_JOURS * 24 * 60 * 60 * 1000;

    if (last && Date.now() - last < cooldown) {
      const reste = Math.ceil((cooldown - (Date.now() - last)) / (1000 * 60 * 60 * 24));
      return interaction.reply({
        content: `❌ Tu as déjà postulé récemment. Réessaie dans **${reste} jour(s)**.`,
        ephemeral: true
      });
    }

    const modal = new ModalBuilder()
      .setCustomId('candidature_modal')
      .setTitle('📝 Candidature Staff');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('q_age')
          .setLabel('Quel est ton âge ?')
          .setPlaceholder('Ex: 17 ans')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(10)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('q_experience')
          .setLabel('As-tu déjà été staff ? Si oui, où ?')
          .setPlaceholder('Ex: Oui, staff sur XYZ pendant 6 mois...')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(500)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('q_motivation')
          .setLabel('Pourquoi veux-tu devenir staff ?')
          .setPlaceholder('Explique ta motivation...')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(800)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('q_dispo')
          .setLabel('Quelle est ta disponibilité par semaine ?')
          .setPlaceholder('Ex: Tous les soirs, weekend complet...')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(100)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('q_plus')
          .setLabel('Un dernier mot pour convaincre l\'équipe ?')
          .setPlaceholder('Ce que tu veux ajouter...')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false)
          .setMaxLength(500)
      ),
    );

    await interaction.showModal(modal);
  }

  // ── Soumission formulaire ──
  if (interaction.isModalSubmit() && interaction.customId === 'candidature_modal') {
    await interaction.deferReply({ ephemeral: true });

    const guildId    = interaction.guild.id;
    const userId     = interaction.user.id;
    const age        = interaction.fields.getTextInputValue('q_age');
    const experience = interaction.fields.getTextInputValue('q_experience');
    const motivation = interaction.fields.getTextInputValue('q_motivation');
    const dispo      = interaction.fields.getTextInputValue('q_dispo');
    const plus       = interaction.fields.getTextInputValue('q_plus') || '*Rien à ajouter*';

    // Sauvegarde JSON
    const data = readJSON('./data/candidatures.json');
    if (!data[guildId]) data[guildId] = {};
    data[guildId][userId] = { age, experience, motivation, dispo, plus, lastApplied: Date.now(), status: 'en attente' };
    writeJSON('./data/candidatures.json', data);

    // Envoi via Webhook
    const embed = new EmbedBuilder()
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
      .setTitle('📋 Nouvelle candidature Staff')
      .setColor('#5865F2')
      .setThumbnail(interaction.user.displayAvatarURL({ size: 128 }))
      .addFields(
        { name: '👤 Candidat',          value: `${interaction.user} (${userId})`, inline: true },
        { name: '🎂 Âge',               value: age,                               inline: true },
        { name: '📅 Disponibilité',     value: dispo,                             inline: false },
        { name: '🏆 Expérience staff',  value: experience,                        inline: false },
        { name: '💬 Motivation',        value: motivation,                        inline: false },
        { name: '✨ Mot de la fin',     value: plus,                              inline: false },
      )
      .setFooter({ text: `Serveur : ${interaction.guild.name} • ID: ${userId}` })
      .setTimestamp();

    await webhookClient.send({
      username: 'Candidatures Staff',
      avatarURL: interaction.guild.iconURL(),
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`accept_${userId}`).setLabel('✅ Accepter').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`refuse_${userId}`).setLabel('❌ Refuser').setStyle(ButtonStyle.Danger)
      )]
    });

    await interaction.editReply({ content: '✅ Candidature envoyée ! Notre équipe te recontactera bientôt. Bonne chance ! 🍀' });
  }

  // ── Accepter ──
  if (interaction.isButton() && interaction.customId.startsWith('accept_')) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles))
      return interaction.reply({ content: '❌ Permission insuffisante.', ephemeral: true });

    const targetId = interaction.customId.replace('accept_', '');
    const data     = readJSON('./data/candidatures.json');
    if (data[interaction.guild.id]?.[targetId]) {
      data[interaction.guild.id][targetId].status = 'accepté';
      writeJSON('./data/candidatures.json', data);
    }

    try {
      const target = await interaction.guild.members.fetch(targetId);
      await target.send({ embeds: [new EmbedBuilder()
        .setTitle('✅ Candidature acceptée !')
        .setDescription(`Félicitations ! Ta candidature sur **${interaction.guild.name}** a été **acceptée** ! 🎉\nUn responsable va te contacter prochainement.`)
        .setColor('#57F287')
        .setTimestamp()
      ]});
    } catch {}

    await interaction.update({
      embeds: [EmbedBuilder.from(interaction.message.embeds[0]).setColor('#57F287').setFooter({ text: `✅ Accepté par ${interaction.user.tag}` })],
      components: []
    });
  }

  // ── Refuser ──
  if (interaction.isButton() && interaction.customId.startsWith('refuse_')) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles))
      return interaction.reply({ content: '❌ Permission insuffisante.', ephemeral: true });

    const targetId = interaction.customId.replace('refuse_', '');
    const data     = readJSON('./data/candidatures.json');
    if (data[interaction.guild.id]?.[targetId]) {
      data[interaction.guild.id][targetId].status = 'refusé';
      writeJSON('./data/candidatures.json', data);
    }

    try {
      const target = await interaction.guild.members.fetch(targetId);
      await target.send({ embeds: [new EmbedBuilder()
        .setTitle('❌ Candidature refusée')
        .setDescription(`Ta candidature sur **${interaction.guild.name}** n'a pas été retenue cette fois.\nTu pourras repostuler dans **${COOLDOWN_JOURS} jours**. Courage ! 💪`)
        .setColor('#ED4245')
        .setTimestamp()
      ]});
    } catch {}

    await interaction.update({
      embeds: [EmbedBuilder.from(interaction.message.embeds[0]).setColor('#ED4245').setFooter({ text: `❌ Refusé par ${interaction.user.tag}` })],
      components: []
    });
  }
}