import { PermissionFlagsBits } from 'discord.js';

export default {
  name: 'purge',
  description: 'Supprime des messages',
  permissions: [PermissionFlagsBits.ManageMessages],

  async execute(message, args) {
    const amount = parseInt(args[0]);
    
    if (!amount || amount < 1 || amount > 100) {
      return message.reply('❌ Usage: `+purge nombre` (entre 1 et 100)');
    }

    try {
      await message.channel.bulkDelete(amount + 1, true);
      const reply = await message.channel.send(`✅ ${amount} message(s) supprimé(s) !`);
      setTimeout(() => reply.delete().catch(() => {}), 5000);
    } catch (error) {
      console.error(error);
      return message.reply('❌ Erreur lors de la suppression.');
    }
  }
};