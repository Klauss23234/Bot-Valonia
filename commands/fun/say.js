import { EmbedBuilder, PermissionsBitField } from 'discord.js';

export default {
  name: 'say',
  description: 'Le bot répète votre message.',
  usage: '+say <message>',
  permissions: [PermissionsBitField.Flags.ManageMessages], // facultatif

  async execute(message, args) {
    if (!args.length) {
      return message.reply('❌ Tu dois fournir un message à répéter.\nEx: `+say Bonjour tout le monde !`');
    }

    const text = args.join(' ');

    // Supprime le message de l'utilisateur pour plus de propreté
    await message.delete().catch(() => {});

    // Envoie le message dans un embed
    const embed = new EmbedBuilder()
      .setColor('#57F287')
      .setDescription(text)
      .setFooter({ text: `Message de ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
};
