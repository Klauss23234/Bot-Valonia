import { PermissionsBitField, EmbedBuilder } from 'discord.js';

export default {
  name: 'roles',
  description: 'Affiche tous les rôles et leurs IDs',
  usage: '+roles',
  category: 'Staff',
  permissions: ['ManageGuild'],

  async execute(message, args) {

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return message.reply("❌ Permission requise : ManageGuild");
    }

    const guild = message.guild;

    // Trier les rôles par position (du plus haut au plus bas)
    const roles = guild.roles.cache
      .sort((a, b) => b.position - a.position)
      .map(role => `🔹 **${role.name}** — \`${role.id}\``)
      .join('\n');

    // Si trop long pour un embed, découper en plusieurs messages
    const chunks = [];
    const lines = roles.split('\n');
    let current = '';

    for (const line of lines) {
      if ((current + '\n' + line).length > 4000) {
        chunks.push(current);
        current = line;
      } else {
        current += (current ? '\n' : '') + line;
      }
    }
    if (current) chunks.push(current);

    // Envoyer chaque chunk dans un embed séparé
    for (let i = 0; i < chunks.length; i++) {
      const embed = new EmbedBuilder()
        .setTitle(i === 0 ? `📋 Rôles du serveur — ${guild.name}` : `📋 Rôles (suite ${i + 1})`)
        .setDescription(chunks[i])
        .setColor('#5865F2')
        .setFooter({ text: `${guild.roles.cache.size} rôles au total` })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    }
  }
};