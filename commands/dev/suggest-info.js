import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  name: 'suggest-info',
  description: 'Affiche les informations sur le système de suggestions',
  aliases: ['suggestion-info', 'sinfo', 'suggest-help'],
  permissions: [PermissionFlagsBits.Administrator],
  async execute(message, args, client) {
    
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setAuthor({ 
        name: 'Système de Suggestions - Guide', 
        iconURL: message.guild.iconURL({ dynamic: true })
      })
      .setDescription('**💡 Comment faire une suggestion ?**\n\nUtilise la commande `/suggest` ou envoie ta suggestion dans ce salon.\nLe staff examinera chaque proposition et y répondra.')
      .addFields(
        {
          name: '\u200b',
          value: '**📊 Les différents statuts :**',
          inline: false
        },
        {
          name: '🟡 En attente',
          value: '```yaml\nTa suggestion est en cours d\'examen\npar l\'équipe de modération.```',
          inline: false
        },
        {
          name: '✅ Acceptée',
          value: '```diff\n+ Félicitations ! Ta suggestion\n+ a été approuvée et sera\n+ implémentée prochainement.```',
          inline: false
        },
        {
          name: '❌ Refusée',
          value: '```diff\n- Ta suggestion a été refusée.\n- Le staff t\'expliquera pourquoi\n- dans la réponse.```',
          inline: false
        },
        {
          name: '🤔 En considération',
          value: '```fix\nTa suggestion est intéressante !\nL\'équipe y réfléchit et discute\nde sa faisabilité.```',
          inline: false
        },
        {
          name: '\u200b',
          value: '**✨ Conseils pour une bonne suggestion :**\n• Sois **clair et précis** dans ton titre\n• **Explique** pourquoi c\'est une bonne idée\n• Propose une **solution concrète**\n• Reste **constructif** et respectueux',
          inline: false
        },
        {
          name: '\u200b',
          value: '**🏆 Les meilleures suggestions seront récompensées !**',
          inline: false
        }
      )
      .setFooter({ 
        text: `${message.guild.name} • Merci pour ta participation !`, 
        iconURL: message.guild.iconURL() 
      })
      .setTimestamp();
    
    // Supprimer le message de commande
    await message.delete().catch(() => {});
    
    // Envoyer l'embed
    await message.channel.send({ embeds: [embed] });
  }
};