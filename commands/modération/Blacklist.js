import { PermissionsBitField, EmbedBuilder } from 'discord.js';

/*
  Structure :
  Map {
    guildId => Map {
        userId => {
            reason,
            author,
            date
        }
    }
  }
*/
const blacklists = new Map();

export default {
    name: 'bl',
    description: 'Gestion de la blacklist',

    async execute(message, args) {
        // Admin uniquement
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("❌ Tu n'as pas la permission.");
        }

        const guild = message.guild;
        const guildId = guild.id;

        if (!blacklists.has(guildId)) {
            blacklists.set(guildId, new Map());
        }

        const bl = blacklists.get(guildId);
        const sub = args[0];

        // =====================
        // +bl add @user [raison]
        // =====================
        if (sub === 'add') {
            const user = message.mentions.users.first();
            if (!user) return message.reply("❌ Mentionne un utilisateur.");

            if (bl.has(user.id)) {
                return message.reply("⚠️ Cet utilisateur est déjà blacklisté.");
            }

            const reason = args.slice(2).join(' ') || 'Aucune raison fournie';

            bl.set(user.id, {
                reason,
                author: message.author.id,
                date: new Date()
            });

            await guild.members.ban(user.id, { reason }).catch(() => {});

            return message.reply(
                `🚫 **${user.tag}** a été blacklisté et banni.\n📝 Raison : ${reason}`
            );
        }

        // =====================
        // +bl del <userID>
        // =====================
        if (sub === 'del') {
            const userId = args[1];
            if (!userId) return message.reply("❌ Donne un ID utilisateur.");

            if (!bl.has(userId)) {
                return message.reply("⚠️ Cet utilisateur n'est pas blacklisté.");
            }

            bl.delete(userId);
            await guild.members.unban(userId).catch(() => {});

            return message.reply(`✅ Utilisateur <@${userId}> retiré de la blacklist et débanni.`);
        }

        // =====================
        // +bl list
        // =====================
        if (sub === 'list') {
            if (bl.size === 0) {
                return message.reply("📭 La blacklist est vide.");
            }

            const embed = new EmbedBuilder()
                .setTitle('🚫 Blacklist du serveur')
                .setColor(0xff0000)
                .setDescription(
                    [...bl.entries()]
                        .map(([id, data]) => `• <@${id}> — ${data.reason}`)
                        .join('\n')
                );

            return message.reply({ embeds: [embed] });
        }

        // =====================
        // +bl info <userID>
        // =====================
if (sub === 'info') {
    const user =
        message.mentions.users.first() ||
        (args[1] ? await message.client.users.fetch(args[1]).catch(() => null) : null);

    if (!user) return message.reply("❌ Mentionne un utilisateur ou donne un ID valide.");

    if (!bl.has(user.id)) {
        return message.reply("❌ Cet utilisateur n'est pas blacklisté.");
    }

    const data = bl.get(user.id);


            const embed = new EmbedBuilder()
                .setTitle('📄 Informations blacklist')
                .setColor(0xff0000)
                .addFields(
                    { name: 'Utilisateur', value: `<@${userId}>`, inline: true },
                    { name: 'Raison', value: data.reason },
                    { name: 'Ajouté par', value: `<@${data.author}>`, inline: true },
                    {
                        name: 'Date',
                        value: `<t:${Math.floor(data.date.getTime() / 1000)}>`
                    }
                );

            return message.reply({ embeds: [embed] });
        }

        // =====================
        // +bl clear
        // =====================
        if (sub === 'clear') {
            bl.clear();
            return message.reply("🧹 Blacklist vidée.");
        }

        // =====================
        // Mauvaise utilisation
        // =====================
        return message.reply(
            "❌ Utilisation :\n" +
            "`+bl add @user [raison]`\n" +
            "`+bl del <userID>`\n" +
            "`+bl list`\n" +
            "`+bl info <userID>`\n" +
            "`+bl clear`"
        );
    }
};
