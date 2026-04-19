module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`🤖 ${client.user.tag} est en ligne !`);
    console.log(`📊 Connecté sur ${client.guilds.cache.size} serveur(s)`);
    console.log(`👥 ${client.users.cache.size} utilisateur(s) visibles`);
    
    client.user.setPresence({
      activities: [{ name: '+help pour les commandes', type: 0 }],
      status: 'online'
    });
  }
};