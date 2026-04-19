import { getCandidatures, addVote } from '../utils/candidaturesManager.js';

export default {
  name: 'messageReactionAdd',
  once: false,
  
  async execute(reaction, user, client) {
    // Ignorer les bots
    if (user.bot) return;
    
    const config = {
      voteChannelId: "ID_DU_SALON_VOTES_STAFF", // À modifier
      staffRoleId: "ID_DU_ROLE_STAFF" // À modifier
    };
    
    // Vérifier qu'on est dans le salon de votes
    if (reaction.message.channel.id !== config.voteChannelId) return;
    
    // Fetch le message si c'est une réaction partielle
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        console.error('Erreur lors du fetch de la réaction:', error);
        return;
      }
    }
    
    // Vérifier que l'utilisateur est staff ou owner
    try {
      const member = await reaction.message.guild.members.fetch(user.id);
      const isStaff = member.roles.cache.has(config.staffRoleId);
      const isOwner = user.id === client.config.ownerId;
      
      if (!isStaff && !isOwner) {
        await reaction.users.remove(user.id);
        return;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du membre:', error);
      return;
    }
    
    // Trouver la candidature correspondante
    const candidatures = getCandidatures();
    const candidature = candidatures.find(
      c => c.voteMessageId === reaction.message.id && c.status === 'pending'
    );
    
    if (!candidature) return;
    
    // Gérer les votes
    if (reaction.emoji.name === '✅') {
      // Retirer la réaction ❌ si elle existe
      const refuseReaction = reaction.message.reactions.cache.get('❌');
      if (refuseReaction) {
        await refuseReaction.users.remove(user.id).catch(() => {});
      }
      
      // Ajouter le vote
      addVote(candidature.id, user.id, 'accept');
      
    } else if (reaction.emoji.name === '❌') {
      // Retirer la réaction ✅ si elle existe
      const acceptReaction = reaction.message.reactions.cache.get('✅');
      if (acceptReaction) {
        await acceptReaction.users.remove(user.id).catch(() => {});
      }
      
      // Ajouter le vote
      addVote(candidature.id, user.id, 'refuse');
    }
  }
};