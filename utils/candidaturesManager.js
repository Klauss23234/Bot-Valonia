import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EmbedBuilder } from 'discord.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const CANDIDATURES_FILE = path.join(DATA_DIR, 'candidatures.json');

// Créer le dossier data s'il n'existe pas
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Créer le fichier candidatures.json s'il n'existe pas
if (!fs.existsSync(CANDIDATURES_FILE)) {
  fs.writeFileSync(CANDIDATURES_FILE, JSON.stringify([], null, 2));
}

// Map pour stocker les votes actifs
const activeVotes = new Map();

/**
 * Charger les candidatures depuis le fichier JSON
 */
export function getCandidatures() {
  try {
    const data = fs.readFileSync(CANDIDATURES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors du chargement des candidatures:', error);
    return [];
  }
}

/**
 * Sauvegarder les candidatures dans le fichier JSON
 */
export function saveCandidatures() {
  try {
    const candidatures = getCandidatures();
    fs.writeFileSync(CANDIDATURES_FILE, JSON.stringify(candidatures, null, 2));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des candidatures:', error);
  }
}

/**
 * Ajouter une nouvelle candidature
 */
export function addCandidature(candidature) {
  const candidatures = getCandidatures();
  candidatures.push(candidature);
  fs.writeFileSync(CANDIDATURES_FILE, JSON.stringify(candidatures, null, 2));
}

/**
 * Mettre à jour une candidature
 */
export function updateCandidature(id, updates) {
  const candidatures = getCandidatures();
  const index = candidatures.findIndex(c => c.id === id);
  
  if (index !== -1) {
    candidatures[index] = { ...candidatures[index], ...updates };
    fs.writeFileSync(CANDIDATURES_FILE, JSON.stringify(candidatures, null, 2));
    return candidatures[index];
  }
  
  return null;
}

/**
 * Ajouter un vote à une candidature
 */
export function addVote(candidatureId, userId, voteType) {
  const candidatures = getCandidatures();
  const candidature = candidatures.find(c => c.id === candidatureId);
  
  if (!candidature || candidature.status !== 'pending') return false;
  
  // Retirer l'utilisateur des deux listes
  candidature.votes.accept = candidature.votes.accept.filter(id => id !== userId);
  candidature.votes.refuse = candidature.votes.refuse.filter(id => id !== userId);
  
  // Ajouter le vote
  if (voteType === 'accept') {
    candidature.votes.accept.push(userId);
  } else if (voteType === 'refuse') {
    candidature.votes.refuse.push(userId);
  }
  
  fs.writeFileSync(CANDIDATURES_FILE, JSON.stringify(candidatures, null, 2));
  return true;
}

/**
 * Démarrer le timer de vote
 */
export function startVoteTimer(candidatureId, durationMs, client, config) {
  setTimeout(async () => {
    await endVote(candidatureId, client, config);
  }, durationMs);
  
  activeVotes.set(candidatureId, {
    endTime: Date.now() + durationMs
  });
}

/**
 * Terminer un vote et annoncer les résultats
 */
export async function endVote(candidatureId, client, config) {
  const candidatures = getCandidatures();
  const candidature = candidatures.find(c => c.id === candidatureId);
  
  if (!candidature || candidature.status !== 'pending') return;
  
  const acceptVotes = candidature.votes.accept.length;
  const refuseVotes = candidature.votes.refuse.length;
  const isAccepted = acceptVotes > refuseVotes;
  
  // Mettre à jour le statut
  candidature.status = isAccepted ? 'accepted' : 'refused';
  fs.writeFileSync(CANDIDATURES_FILE, JSON.stringify(candidatures, null, 2));
  
  // Récupérer les salons
  const voteChannel = client.channels.cache.get(config.voteChannelId);
  const candidatureChannel = client.channels.cache.get(config.candidatureChannelId);
  const logsChannel = client.channels.cache.get(config.logsChannelId);
  
  // Mettre à jour le message de vote
  if (voteChannel && candidature.voteMessageId) {
    try {
      const voteMsg = await voteChannel.messages.fetch(candidature.voteMessageId);
      const finalEmbed = EmbedBuilder.from(voteMsg.embeds[0])
        .setColor(isAccepted ? '#00FF00' : '#FF0000')
        .addFields(
          { name: '📊 Résultat Final', value: `✅ Accepter: **${acceptVotes}**\n❌ Refuser: **${refuseVotes}**`, inline: false }
        )
        .setFooter({ text: `ID: ${candidature.id} | ${isAccepted ? 'ACCEPTÉE ✅' : 'REFUSÉE ❌'}` });
      
      await voteMsg.edit({ embeds: [finalEmbed] });
      await voteMsg.reactions.removeAll().catch(() => {});
    } catch (error) {
      console.error('Erreur lors de la mise à jour du message de vote:', error);
    }
  }
  
  // Poster le résultat dans le salon candidatures
  if (candidatureChannel) {
    const resultEmbed = new EmbedBuilder()
      .setColor(isAccepted ? '#00FF00' : '#FF0000')
      .setTitle(isAccepted ? '✅ Candidature Acceptée' : '❌ Candidature Refusée')
      .setDescription(`**Candidat:** <@${candidature.userId}> (${candidature.username})`)
      .addFields(
        { name: '📊 Résultat des votes', value: `✅ Pour: **${acceptVotes}**\n❌ Contre: **${refuseVotes}**`, inline: false }
      )
      .setFooter({ text: `ID: ${candidature.id}` })
      .setTimestamp();
    
    await candidatureChannel.send({ embeds: [resultEmbed] });
  }
  
  // Envoyer un MP au candidat
  try {
    const user = await client.users.fetch(candidature.userId);
    const dmEmbed = new EmbedBuilder()
      .setColor(isAccepted ? '#00FF00' : '#FF0000')
      .setTitle(isAccepted ? '🎉 Candidature Acceptée !' : '😔 Candidature Refusée')
      .setDescription(
        isAccepted
          ? 'Félicitations ! Ta candidature au staff a été acceptée. Un administrateur te contactera bientôt pour les prochaines étapes.'
          : 'Malheureusement, ta candidature au staff n\'a pas été retenue cette fois-ci. N\'hésite pas à repostuler plus tard !'
      )
      .addFields(
        { name: '📊 Résultat des votes', value: `✅ Pour: **${acceptVotes}**\n❌ Contre: **${refuseVotes}**` }
      )
      .setTimestamp();
    
    await user.send({ embeds: [dmEmbed] });
  } catch (error) {
    console.error('Impossible d\'envoyer un MP au candidat:', error);
  }
  
  // Logs
  if (logsChannel) {
    const logEmbed = new EmbedBuilder()
      .setColor(isAccepted ? '#00FF00' : '#FF0000')
      .setTitle('🗳️ Vote Terminé')
      .setDescription(
        `**Candidat:** <@${candidature.userId}> (${candidature.username})\n` +
        `**ID:** ${candidature.id}\n` +
        `**Résultat:** ${isAccepted ? '✅ ACCEPTÉE' : '❌ REFUSÉE'}`
      )
      .addFields(
        { name: '📊 Votes', value: `✅ Pour: **${acceptVotes}**\n❌ Contre: **${refuseVotes}**` }
      )
      .setTimestamp();
    
    await logsChannel.send({ embeds: [logEmbed] });
  }
  
  activeVotes.delete(candidatureId);
}

/**
 * Obtenir les votes actifs
 */
export function getActiveVotes() {
  return activeVotes;
}