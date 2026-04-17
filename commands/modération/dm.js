import { PermissionsBitField, EmbedBuilder } from 'discord.js';

export default {
  name: 'dm',
  description: 'Envoie un message privé à un membre du serveur',
  usage: '+dm @User <message>',
  permissions: [PermissionsBitField.Flags.Administrator], // seul un admin peut utiliser cette commande

  async execute(message, args) {
    // Vérifie qu'un utilisateur est mentionné
    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('❌ Mentionne un utilisateur à qui envoyer le message.\nEx: `+dm @User Salut !`');
    }

    // Vérifie que le message existe
    const text = args.slice(1).join(' ');
    if (!text) {
      return message.reply('❌ Tu dois écrire un message à envoyer.\nEx: `+dm @User Salut !`');
    }

    try {
      // Création d'un embed pour le DM
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('📩 Nouveau message de ton serveur')
        .setDescription(text)
        .setFooter({ text: `Envoyé par ${message.author.tag}` })
        .setTimestamp();

      // Envoie le DM
      await member.send({ embeds: [embed] });

      // Confirme dans le canal
      return message.channel.send(`✅ Le message a bien été envoyé à ${member.user.tag}.`);
    } catch (error) {
      console.error('[DM COMMAND ERROR]', error);
      return message.reply('❌ Impossible d’envoyer le message à cet utilisateur. Il a peut-être bloqué les DMs.');
    }
  }
};
