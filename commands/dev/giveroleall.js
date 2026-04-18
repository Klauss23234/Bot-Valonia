import { PermissionFlagsBits } from 'discord.js';

export default {
  name: 'giveroleall',
  description: 'Donne un rôle à tous les membres du serveur',

  async execute(message, args, client) {

    // Vérif permission
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator))
      return message.reply('❌ Tu n\'as pas la permission.');

    const role = message.mentions.roles.first();
    if (!role)
      return message.reply('❌ Mentionne un rôle valide.');

    message.reply(`⏳ Attribution du rôle ${role} à tous les membres...`);

    const members = await message.guild.members.fetch();

    let success = 0;
    let failed = 0;

    for (const member of members.values()) {

      // Skip bots si tu veux
      if (member.user.bot) continue;

      try {
        if (!member.roles.cache.has(role.id)) {
          await member.roles.add(role);
          success++;
        }
      } catch (err) {
        failed++;
      }
    }

    message.channel.send(
      `✅ Terminé !\n` +
      `✔️ Ajouté à : ${success} membres\n` +
      `❌ Échecs : ${failed}`
    );
  },
};