import { PermissionsBitField } from 'discord.js';

// Helper pour convertir des durées (ex: 5m -> 300000ms)
function parseDuration(duration) {
  if (!duration) return null;
  const match = duration.match(/^(\d+)(s|m|h)$/);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2];
  if (unit === 's') return value * 1000;
  if (unit === 'm') return value * 60 * 1000;
  if (unit === 'h') return value * 60 * 60 * 1000;
  return null;
}

export default {
  name: 'vc', // nom global
  description: 'Muter ou unmuter un utilisateur en vocal',
  usage: '+mutevc @User [durée] | +unmutevc @User',
  permissions: [PermissionsBitField.Flags.MuteMembers],

  async execute(message, args) {
    const command = message.content.split(' ')[0].toLowerCase(); // +mutevc ou +unmutevc
    const member = message.mentions.members.first();

    if (!member) return message.reply('❌ Mentionne un utilisateur. Ex: `+mutevc @User` ou `+unmutevc @User`');
    if (!member.voice.channel) return message.reply('❌ Cet utilisateur n\'est pas dans un canal vocal.');

    // Vérifie les permissions du bot
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      return message.reply('❌ Je n\'ai pas la permission de muter/débloquer cet utilisateur.');
    }

    try {
      // ===== MUTER =====
      if (command === '+mutevc') {
        if (member.voice.serverMute) {
          return message.reply(`⚠️ ${member.user.tag} est déjà mute.`);
        }

        // Vérifie durée si spécifiée
        const durationArg = args[1]; // ex: 5m, 10s, 1h
        const durationMs = parseDuration(durationArg);

        await member.voice.setMute(true, `Muté par ${message.author.tag}`);
        message.channel.send(`🔇 ${member.user.tag} a été **muté** en vocal${durationMs ? ` pour ${durationArg}` : ''}.`);

        // Si durée spécifiée, unmute automatique après
        if (durationMs) {
          setTimeout(async () => {
            if (member.voice.channel && member.voice.serverMute) {
              try {
                await member.voice.setMute(false, 'Mute temporaire terminé');
                message.channel.send(`🔊 ${member.user.tag} a été **remis** en vocal automatiquement.`);
              } catch (err) {
                console.error('[AUTO UNMUTE ERROR]', err);
              }
            }
          }, durationMs);
        }
        return;
      }

      // ===== UNMUTE =====
      if (command === '+unmutevc') {
        if (!member.voice.serverMute) {
          return message.reply(`⚠️ ${member.user.tag} n'est pas mute.`);
        }
        await member.voice.setMute(false, `Unmute par ${message.author.tag}`);
        return message.channel.send(`🔊 ${member.user.tag} a été **remis** en vocal.`);
      }

      return message.reply('❌ Commande invalide.');
    } catch (error) {
      console.error('[VC COMMAND ERROR]', error);
      return message.channel.send('❌ Impossible de changer le statut vocal de cet utilisateur.');
    }
  }
};
