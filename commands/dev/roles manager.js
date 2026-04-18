import { PermissionFlagsBits } from 'discord.js';

export default {
  name: 'roles',
  description: 'Affiche la liste de tous les rôles avec leurs IDs',
  aliases: ['listroles', 'rolelist'],
  permissions: [PermissionFlagsBits.ManageRoles],

  async execute(message, args, client) {
    const roles = message.guild.roles.cache
      .filter(r => r.id !== message.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => `${r.name} - \`${r.id}\``)
      .join('\n');

    if (roles.length > 2000) {
      const chunks = roles.match(/[\s\S]{1,1900}/g) || [];
      
      for (const chunk of chunks) {
        await message.channel.send(chunk);
      }
    } else {
      message.reply(`**📋 Liste des rôles :**\n${roles}`);
    }
  }
};