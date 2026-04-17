import {
EmbedBuilder,
PermissionFlagsBits
} from "discord.js";

const AVIS_CHANNEL_ID = "1493634616056348732";
const SUGGESTION_CHANNEL_ID = "1489722775248699470";

export default {

name: "setupvacances",
description: "Créer le panneau d'information Vacances",

async execute(message){

if(!message.member.permissions.has(PermissionFlagsBits.ManageGuild))
return message.reply("❌ Tu n'as pas la permission.");

const embed = new EmbedBuilder()

.setColor("#5865F2")

.setTitle("📅 Vacances scolaires 2025 - 2026")

.setDescription(
`Voici un récapitulatif des **vacances scolaires en Belgique 🇧🇪 et en France 🇫🇷 (zones A / B / C)**.

Parfait pour s’organiser entre membres 👇`
)

.addFields(

{
name:"🇧🇪 Belgique",
value:
`**Toussaint** : 27 octobre → 2 novembre 2025  
**Noël** : 22 décembre 2025 → 4 janvier 2026  
**Carnaval (détente)** : 23 février → 8 mars 2026  
**Printemps (Pâques)** : 27 avril → 10 mai 2026  
**Été** : à partir du 4 juillet 2026`,
inline:false
},

{
name:"🇫🇷 Zone A",
value:
`**Toussaint** : 18 octobre → 3 novembre 2025  
**Noël** : 20 décembre 2025 → 5 janvier 2026  
**Hiver** : 7 février → 23 février 2026  
**Printemps** : 4 avril → 20 avril 2026  
**Été** : à partir du 4 juillet 2026`,
inline:false
},

{
name:"🇫🇷 Zone B",
value:
`**Toussaint** : 18 octobre → 3 novembre 2025  
**Noël** : 20 décembre 2025 → 5 janvier 2026  
**Hiver** : 14 février → 2 mars 2026  
**Printemps** : 11 avril → 27 avril 2026  
**Été** : à partir du 4 juillet 2026`,
inline:false
},

{
name:"🇫🇷 Zone C",
value:
`**Toussaint** : 18 octobre → 3 novembre 2025  
**Noël** : 20 décembre 2025 → 5 janvier 2026  
**Hiver** : 21 février → 9 mars 2026  
**Printemps** : 18 avril → 4 mai 2026  
**Été** : à partir du 4 juillet 2026`,
inline:false
},

{
name:"🗳️ Votre avis",
value:
`💬 Donnez votre avis dans <#${AVIS_CHANNEL_ID}>

💡 Proposez vos suggestions dans <#${SUGGESTION_CHANNEL_ID}>`,
inline:false
}

)

.setFooter({
text:" Valonia • Vacances"
})

.setTimestamp();

await message.channel.send({
content: "<@&1489722636391940277>",
embeds:[embed]
});

message.delete().catch(()=>{})

}

}