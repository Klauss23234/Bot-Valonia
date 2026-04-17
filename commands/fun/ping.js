export default {
  name: 'ping',
  description: 'Répond pong pour tester le bot',
  usage: '',
  execute(message, args, client) {
    const { config } = client;
    const prefix = config.prefix;

    message.reply(`Pong ! Commande utilisée : \`${prefix}ping\``);
  }
};
