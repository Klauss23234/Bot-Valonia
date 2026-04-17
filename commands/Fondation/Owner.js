import { PermissionsBitField, EmbedBuilder } from 'discord.js';

const OWNER_ROLE_ID = '1409519868780351509';

// Stockage en mémoire
const owners = new Set();

export default {
    name: 'owner',
    description: 'Gestion des owners du bot',

    async execute(message, args, client) {
        // Admin uniquement
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("❌ Tu n'as pas la permission.");
        }

        const sub = args[0]; // add | del | list | clear
        const role = message.guild.roles.cache.get(OWNER_ROLE_ID);

        if (!role) return message.reply("❌ Rôle owner introuvable.");

        // +owner add @user
        if (sub === 'add') {
            const user = message.mentions.users.first();
            if (!user) return message.reply("❌ Mentionne un utilisateur.");

            if (owners.has(user.id)) {
                return message.reply("⚠️ Cet utilisateur est déjà owner.");
            }

            const member = await message.guild.members.fetch(user.id).catch(() => null);
            if (!member) return message.reply("❌ Utilisateur introuvable.");

            owners.add(user.id);
            await member.roles.add(role);

            return message.reply(`✅ **${user.tag}** est maintenant owner.`);
        }

        // +owner del @user
        if (sub === 'del') {
            const user = message.mentions.users.first();
            if (!user) return message.reply("❌ Mentionne un utilisateur.");

            if (!owners.has(user.id)) {
                return message.reply("⚠️ Cet utilisateur n'est pas owner.");
            }

            const member = await message.guild.members.fetch(user.id).catch(() => null);
            if (member) await member.roles.remove(role);

            owners.delete(user.id);
            return message.reply(`🗑️ **${user.tag}** n'est plus owner.`);
        }

        // +owner list
        if (sub === 'list') {
            if (owners.size === 0) {
                return message.reply("📭 Aucun owner défini.");
            }

            const embed = new EmbedBuilder()
                .setTitle('👑 Liste des owners')
                .setColor(0x00AE86)
                .setDescription([...owners].map(id => `<@${id}>`).join('\n'));

            return message.reply({ embeds: [embed] });
        }

        // +owner clear
        if (sub === 'clear') {
            for (const id of owners) {
                const member = await message.guild.members.fetch(id).catch(() => null);
                if (member) await member.roles.remove(role);
            }

            owners.clear();
            return message.reply("🧹 Tous les owners ont été supprimés.");
        }

        // Mauvaise sous-commande
        return message.reply(
            "❌ Utilisation : `+owner add @user`, `+owner del @user`, `+owner list`, `+owner clear`"
        );
    }
};
