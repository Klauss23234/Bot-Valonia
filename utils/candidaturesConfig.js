/**
 * Configuration du système de candidatures staff
 * 
 * ⚠️ IMPORTANT: Remplace tous les IDs par les vrais IDs de ton serveur Discord
 * 
 * Comment obtenir les IDs ?
 * 1. Active le Mode Développeur dans Discord (Paramètres > Avancés > Mode développeur)
 * 2. Clique droit sur un salon/rôle → Copier l'identifiant
 */

export default {
  // 📢 Salon où les membres postulent (PUBLIC)
  candidatureChannelId: "1468324244634079446",
  
  // 🗳️ Salon où le staff vote (PRIVÉ STAFF)
  voteChannelId: "1468324296983318722",
  
  // 📋 Salon des logs (PRIVÉ)
  logsChannelId: "1468324341312782500",
  
  // 👤 ID du rôle staff qui peut voter
  staffRoleId: "1409519874056912987",
  
  // 🎨 Couleur des embeds (format hexadécimal)
  embedColor: "#5865F2",
  
  // ⏰ Temps pour répondre à chaque question (en millisecondes)
  // 300000 = 5 minutes
  questionTimeout: 300000,
  
  // 📝 Questions du formulaire (tu peux les modifier)
  questions: [
    '**1️⃣ Quel est ton âge ?**',
    '**2️⃣ As-tu une expérience en modération Discord ?** (Décris-la)',
    '**3️⃣ Pourquoi veux-tu rejoindre le staff ?**',
    '**4️⃣ Quelles sont tes disponibilités ?** (Heures et jours)',
    '**5️⃣ Comment réagirais-tu face à un conflit entre membres ?**'
  ]
};


