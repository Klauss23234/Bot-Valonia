import { EmbedBuilder, PermissionFlagsBits } from "discord.js";

export default {
    name: "setupcommandbot",
    description: "Explique l'utilité du salon Command Bot et comment utiliser le bot",

    async execute(message, args) {

        // Vérifie que l'utilisateur a la permission de gérer le serveur
        if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) 
            return message.reply("❌ Tu n'as pas la permission d'utiliser cette commande.");

        const embed = new EmbedBuilder()
            .setColor("#0099FF")
            .setTitle("💡 Salon Command Bot")
            .setDescription(
`Bienvenue dans le **salon Command Bot** !  
Ce salon est dédié à toutes les commandes de notre bot pour le serveur.`)
            .addFields(
                { name: "📌 Préfixe du bot", value: "Toutes les commandes du bot commencent par le préfixe `+`." },
                { name: "🛠 Exemple de commande", value: "`+recrutement on` → ouvre le recrutement staff." },
                { name: "💡 Rappel", value: "Merci de ne pas spammer ce salon avec d'autres messages, il est réservé uniquement aux commandes du bot." }
            )
            .setFooter({ text: "Amity Bot • Command Bot" })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    }
};