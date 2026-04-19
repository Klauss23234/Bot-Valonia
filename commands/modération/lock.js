import { PermissionsBitField, EmbedBuilder } from 'discord.js';

const prefix = '+';

export default {
    name: 'lock',
    description: 'Verrouille ou déverrouille le canal actuel.',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('❌ Permission refusée')
                .setDescription('Vous n’avez pas la permission de gérer ce canal.');
            return message.reply({ embeds: [embed] }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 15000);
            });
        }

        const action = args[0]?.toLowerCase();
        if (!action || !['lock', 'unlock'].includes(action)) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setTitle('ℹ️ Utilisation')
                .setDescription(`\`${prefix}lock lock\` → verrouiller le canal\n\`${prefix}lock unlock\` → déverrouiller le canal`);
            return message.reply({ embeds: [embed] }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 15000);
            });
        }

        try {
            if (action === 'lock') {
                // Verrouillage
                await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                    SendMessages: false
                });

                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('🔒 Canal verrouillé')
                    .setDescription(`Le canal ${message.channel} est maintenant verrouillé pour tous les membres.`);
                const msg = await message.reply({ embeds: [embed] });
                // Supprimer le message après 15 secondes
                setTimeout(() => msg.delete().catch(() => {}), 15000);
            } else if (action === 'unlock') {
                // Déverrouillage
                await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                    SendMessages: null
                });

                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('🔓 Canal déverrouillé')
                    .setDescription(`Le canal ${message.channel} est maintenant déverrouillé pour tous les membres.`);
                const msg = await message.reply({ embeds: [embed] });
                // Supprimer le message après 15 secondes
                setTimeout(() => msg.delete().catch(() => {}), 15000);
            }
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('❌ Erreur')
                .setDescription('Impossible de modifier les permissions de ce canal.');
            message.reply({ embeds: [embed] }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 15000);
            });
        }
    }
};
