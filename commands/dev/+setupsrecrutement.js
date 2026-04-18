import { EmbedBuilder, PermissionFlagsBits } from "discord.js";

let recrutementOuvert = false;
let acceptedMembers = []; // Membres acceptés
let rejectedMembers = []; // Membres refusés
const resultsChannelId = "1480708973010354237"; // Remplace par ton salon de résultats

export default {

    name: "recrutement",
    aliases: ["setuprecrutement"],
    description: "Gestion du recrutement staff",

    async execute(message, args) {

        if(!message.member.permissions.has(PermissionFlagsBits.ManageGuild))
            return message.reply("❌ Tu n'as pas la permission.");

        const option = args[0]?.toLowerCase();
        if(!option)
            return message.reply("❌ Utilisation : `+recrutement on/off/resultats/addaccept/addreject/removeaccept/removereject`");

        // ════════════════════════════════
        // 🟢 RECRUTEMENT OUVERT
        // ════════════════════════════════
        if(option === "on") {

            recrutementOuvert = true;

            const embed = new EmbedBuilder()
                .setColor("#2ecc71")
                .setTitle("📢 RECRUTEMENT STAFF OUVERT")
                .setDescription(
`━━━━━━━━━━━━━━━━━━

Le **recrutement staff est actuellement ouvert** !

Nous recherchons des membres sérieux  
pour rejoindre l'équipe du serveur.

━━━━━━━━━━━━━━━━━━

📋 **Conditions :**

• Être actif sur le serveur  
• Être respectueux envers les membres  
• Avoir une bonne motivation  
• Savoir travailler en équipe  

━━━━━━━━━━━━━━━━━━

📬 **Comment postuler ?**

Rendez-vous dans le salon candidature  
et remplissez le formulaire.

━━━━━━━━━━━━━━━━━━`
                )
                .setFooter({ text: "Amity Bot • Recrutement" })
                .setTimestamp();

            await message.channel.send({ embeds:[embed] });
            return message.reply("🟢 Recrutement activé.");
        }

        // ════════════════════════════════
        // 🔴 RECRUTEMENT FERMÉ
        // ════════════════════════════════
        if(option === "off") {

            recrutementOuvert = false;

            const embed = new EmbedBuilder()
                .setColor("#e74c3c")
                .setTitle("📢 RECRUTEMENT STAFF FERMÉ")
                .setDescription(
`━━━━━━━━━━━━━━━━━━

Le **recrutement staff est maintenant fermé**.

Merci à toutes les personnes  
ayant envoyé une candidature.

━━━━━━━━━━━━━━━━━━

📋 Les candidatures sont actuellement
en cours d'analyse par le staff.

━━━━━━━━━━━━━━━━━━`
                )
                .setFooter({ text: "Amity Bot • Recrutement" })
                .setTimestamp();

            await message.channel.send({ embeds:[embed] });
            return message.reply("🔴 Recrutement fermé.");
        }

        // ─────────────── AJOUTER ACCEPTÉ ───────────────
        if(option === "addaccept") {
            const member = message.mentions.members.first();
            if(!member) return message.reply("❌ Mentionne un membre à accepter.");
            if(acceptedMembers.includes(member.id)) return message.reply("✅ Ce membre est déjà accepté.");
            acceptedMembers.push(member.id);
            rejectedMembers = rejectedMembers.filter(id => id !== member.id); // Retire des refusés si existait
            return message.reply(`✅ ${member} ajouté à la liste des acceptés.`);
        }

        // ─────────────── AJOUTER REFUSÉ ───────────────
        if(option === "addreject") {
            const member = message.mentions.members.first();
            if(!member) return message.reply("❌ Mentionne un membre à refuser.");
            if(rejectedMembers.includes(member.id)) return message.reply("❌ Ce membre est déjà refusé.");
            rejectedMembers.push(member.id);
            acceptedMembers = acceptedMembers.filter(id => id !== member.id); // Retire des acceptés si existait
            return message.reply(`❌ ${member} ajouté à la liste des refusés.`);
        }

        // ─────────────── SUPPRIMER ACCEPTÉ ───────────────
        if(option === "removeaccept") {
            const member = message.mentions.members.first();
            if(!member) return message.reply("❌ Mentionne un membre à retirer des acceptés.");
            acceptedMembers = acceptedMembers.filter(id => id !== member.id);
            return message.reply(`✅ ${member} retiré de la liste des acceptés.`);
        }

        // ─────────────── SUPPRIMER REFUSÉ ───────────────
        if(option === "removereject") {
            const member = message.mentions.members.first();
            if(!member) return message.reply("❌ Mentionne un membre à retirer des refusés.");
            rejectedMembers = rejectedMembers.filter(id => id !== member.id);
            return message.reply(`✅ ${member} retiré de la liste des refusés.`);
        }

        // ─────────────── RESULTATS ───────────────
        if(option === "resultats") {
            const resultsChannel = message.guild.channels.cache.get(resultsChannelId);
            if(!resultsChannel) return message.reply("❌ Salon de résultats introuvable.");

            const acceptedList = acceptedMembers.length > 0
                ? acceptedMembers.map(id => `<@${id}>`).join("\n")
                : "Aucun membre accepté.";

            const rejectedList = rejectedMembers.length > 0
                ? rejectedMembers.map(id => `<@${id}>`).join("\n")
                : "Aucun membre refusé.";

            const embed = new EmbedBuilder()
                .setColor("#5865F2")
                .setTitle("🏆 RÉSULTATS DU RECRUTEMENT")
                .setDescription(
`━━━━━━━━━━━━━━━━━━
🎉 **Acceptés :**
${acceptedList}

❌ **Refusés :**
${rejectedList}
━━━━━━━━━━━━━━━━━━

🙏 Merci à tous pour votre participation !`
                )
                .setFooter({ text: "Amity Bot • Recrutement" })
                .setTimestamp();

            await resultsChannel.send({ embeds:[embed] });
            return message.reply(`🏆 Résultats envoyés dans ${resultsChannel}`);
        }
    }
};

// 🔹 Commandes principales

// +recrutement on → Ouvre le recrutement.

// +recrutement off → Ferme le recrutement.

// +recrutement resultats → Envoie les résultats dans le salon spécial.

// 🔹 Gestion des membres acceptés

// +recrutement addaccept @membre → Ajoute un membre à la liste des acceptés.

// +recrutement removeaccept @membre → Retire un membre de la liste des acceptés.

// 🔹 Gestion des membres refusés

// +recrutement addreject @membre → Ajoute un membre à la liste des refusés.

//  +recrutement removereject @membre → Retire un membre de la liste des refusés.