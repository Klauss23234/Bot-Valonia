import { 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle 
} from 'discord.js';

// ============================================
// ⚙️ CONFIG
// ============================================
const CONFIG = {
  AVIS_CHANNEL_ID:  '000000000000000000', // 👈 Salon où les avis arrivent
  PANEL_CHANNEL_ID: '000000000000000000', // 👈 Salon où le panel est envoyé
};
// ============================================

// Compteur d'avis
let avisCount = 0;

// 📌 Fonction qui envoie le panel
async function envoyerPanel(guild) {
  const channel = guild.channels.cache.get(CONFIG.PANEL_CHANNEL_ID);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(0x00AE86)
    .setTitle('💬 Donne ton avis sur le serveur !')
    .setDescription(
      '> Tu as quelque chose à dire sur **VALONIA** ?\n' +
      '> Ton avis compte vraiment pour nous ! 💙\n\n' +
      '**Que ce soit positif ou négatif**, on lit tout et on prend en compte chaque retour pour améliorer le serveur.'
    )
    .addFields(
      { name: '⭐ Pourquoi donner son avis ?', value: '> Aide la communauté à grandir et évoluer !', inline: false },
      { name: '🔒 Confidentialité', value: '> Ton avis est posté anonymement si tu le souhaites.', inline: false },
    )
    .setFooter({ text: 'VALONIA • Vos avis nous tiennent à cœur 💙' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('donner_avis')
      .setLabel('✍️ Donner mon avis')
      .setStyle(ButtonStyle.Primary),
  );

  await channel.send({ embeds: [embed], components: [row] });
}

// 📌 Commande +avis
export default {
  name: 'avis',

  async execute(message, args, client) {
    if (message.author.id !== client.config.ownerId) return;

    await envoyerPanel(message.guild);
    await message.reply('✅ Panel d\'avis envoyé !');
  }
};

// 📌 Gestion bouton + modal
export async function handleAvisInteraction(interaction) {

  // Bouton → ouvre le modal
  if (interaction.customId === 'donner_avis') {
    const modal = new ModalBuilder()
      .setCustomId('modal_avis')
      .setTitle('✍️ Ton avis sur VALONIA');

    const noteInput = new TextInputBuilder()
      .setCustomId('note')
      .setLabel('Ta note (1 à 5)')
      .setPlaceholder('Ex: 5')
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(1)
      .setRequired(true);

    const avisInput = new TextInputBuilder()
      .setCustomId('avis')
      .setLabel('Ton avis')
      .setPlaceholder('Dis-nous ce que tu penses du serveur...')
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(10)
      .setMaxLength(1000)
      .setRequired(true);

    const anonymeInput = new TextInputBuilder()
      .setCustomId('anonyme')
      .setLabel('Anonyme ? (oui / non)')
      .setPlaceholder('oui')
      .setStyle(TextInputStyle.Short)
      .setMinLength(2)
      .setMaxLength(3)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(noteInput),
      new ActionRowBuilder().addComponents(avisInput),
      new ActionRowBuilder().addComponents(anonymeInput),
    );

    return await interaction.showModal(modal);
  }

  // Modal soumis → poste l'avis
  if (interaction.customId === 'modal_avis') {
    const noteRaw = interaction.fields.getTextInputValue('note').trim();
    const avisTexte = interaction.fields.getTextInputValue('avis').trim();
    const anonyme = interaction.fields.getTextInputValue('anonyme').trim().toLowerCase();

    const note = parseInt(noteRaw);
    if (isNaN(note) || note < 1 || note > 5) {
      return interaction.reply({ content: '❌ La note doit être un chiffre entre 1 et 5 !', ephemeral: true });
    }

    const etoiles = '⭐'.repeat(note) + '☆'.repeat(5 - note);
    const estAnonyme = anonyme === 'oui';
    const auteur = estAnonyme ? 'Anonyme 🔒' : interaction.user.username;
    const avatar = estAnonyme ? null : interaction.user.displayAvatarURL({ dynamic: true });

    const couleurs = { 1: 0xFF4444, 2: 0xFF8C00, 3: 0xFFD700, 4: 0x90EE90, 5: 0x00AE86 };

    const embed = new EmbedBuilder()
      .setColor(couleurs[note])
      .setTitle(`${etoiles} Nouvel avis !`)
      .setDescription(`> *"${avisTexte}"*`)
      .addFields(
        { name: '👤 Membre', value: auteur, inline: true },
        { name: '⭐ Note', value: `${note}/5`, inline: true },
      )
      .setThumbnail(avatar)
      .setFooter({ text: 'VALONIA • Merci pour ton retour 💙' })
      .setTimestamp();

    const avisChannel = interaction.guild.channels.cache.get(CONFIG.AVIS_CHANNEL_ID);
    if (avisChannel) await avisChannel.send({ embeds: [embed] });

    // 🔄 Compteur — renvoie le panel tous les 2 avis
    avisCount++;
    if (avisCount % 2 === 0) {
      await envoyerPanel(interaction.guild);
    }

    return interaction.reply({
      content: '✅ Merci pour ton avis ! On en prend note 💙',
      ephemeral: true,
    });
  }
}