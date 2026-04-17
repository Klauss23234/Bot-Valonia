import { Client, GatewayIntentBits, Partials, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  partials: [Partials.Channel],
});

client.once('ready', () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  console.log(`Interaction reçue: ${interaction.type}`);

  if (interaction.isChatInputCommand()) {
    console.log(`Commande slash reçue: ${interaction.commandName}`);

    if (interaction.commandName === 'reglement') {
      const embed = new EmbedBuilder()
        .setColor('#e100ff')
        .setTitle('📜 Règlement officiel du serveur 110TH')
        .setDescription('Clique sur le bouton pour accepter le règlement.')
        .setTimestamp();

      const acceptButton = new ButtonBuilder()
        .setCustomId('accept_rules')
        .setLabel('✅ J’accepte le règlement')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(acceptButton);

      await interaction.reply({ embeds: [embed], components: [row] });
    }
  } else if (interaction.isButton()) {
    console.log(`Bouton cliqué: ${interaction.customId} par ${interaction.user.tag}`);

    if (interaction.customId === 'accept_rules') {
      const roleId = '1402463951329034331';
      const role = interaction.guild.roles.cache.get(roleId);

      if (!role) {
        console.log('Rôle introuvable');
        return interaction.update({ content: '❌ Rôle introuvable.', components: [], ephemeral: true });
      }

      try {
        await interaction.member.roles.add(role);
        console.log(`Rôle attribué à ${interaction.user.tag}`);
        return interaction.update({ content: '✅ Rôle attribué !', components: [], ephemeral: true });
      } catch (error) {
        console.error('Erreur lors de l’attribution du rôle:', error);
        return interaction.update({ content: '❌ Erreur lors de l’attribution du rôle.', components: [], ephemeral: true });
      }
    }
  }
});

// Enregistrement de la commande slash (à lancer une seule fois pour l’enregistrer sur ton serveur)
client.on('ready', async () => {
  const data = new SlashCommandBuilder()
    .setName('reglement')
    .setDescription('Affiche le règlement du serveur 110TH')
    .toJSON();

  await client.application.commands.set([data]);
  console.log('Commande /reglement enregistrée');
});

client.login(process.env.TOKEN);
