export default {
  name: 'clear',
  description: 'Supprime un nombre de messages dans le salon.',
  usage: '<nombre>', // ex : +clear 10
  permissions: ['ManageMessages'], // nécessite la permission de gérer les messages
  async execute(message, args) {
    // Vérification des arguments
    const amount = parseInt(args[0], 10);
    if (!amount || amount <= 0) {
      return message.reply('❌ Veuillez indiquer un nombre de messages à supprimer.').then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 5000);
      });
    }

    if (amount > 100) {
      return message.reply('❌ Vous ne pouvez pas supprimer plus de 100 messages à la fois.').then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 5000);
      });
    }

    // Supprimer les messages
    try {
      const deletedMessages = await message.channel.bulkDelete(amount, true);

      const replyMsg = await message.channel.send(`✅ ${deletedMessages.size} messages supprimés.`);
      setTimeout(() => replyMsg.delete().catch(() => {}), 5000);

    } catch (err) {
      console.error(err);
      message.reply('❌ Impossible de supprimer les messages, vérifiez les permissions du bot.').then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 5000);
      });
    }
  }
};
