import {
EmbedBuilder,
PermissionFlagsBits
} from "discord.js";

export default {

name: "setupsleepcall",
description: "Créer le panneau d'information SleepCall",

async execute(message){

if(!message.member.permissions.has(PermissionFlagsBits.ManageGuild))
return message.reply("❌ Tu n'as pas la permission.");

const embed = new EmbedBuilder()

.setColor("#5865F2")

.setTitle("🌙 SleepCall • Informations")

.setDescription(
`Bienvenue dans le **SleepCall** !

Ce salon vocal est destiné à ceux qui souhaitent **dormir en appel**, se **détendre**, ou simplement profiter d'une **présence calme**.

Merci de respecter les règles pour garder un espace agréable pour tout le monde.`
)

.addFields(

{
name:"🛌 Utilisation",
value:
`• Utilise ce vocal pour dormir en appel  
• Merci d'être de ne pas spam les leaves vocal **  
• Vous serrez automatiquement mute arrivé dans le salon`,
inline:false
},

{
name:"🔇 Respect des autres",
value:
`• Pas de moov 
• Pas de cris ou de troll  
• Respecte le sommeil des autres`,
inline:false
},

{
name:"⚠️ Interdictions",
value:
`• Troll ou réveiller volontairement  
• Musique forte / soundboard abusif  
• Comportement toxique`,
inline:false
},

{
name:"💤 Conseil",
value:
`Si tu comptes dormir, pense à **baisser ton micro** ou utiliser **Push-to-Talk**.`,
inline:false
}

)

.setFooter({
text:"Amity Bot • SleepCall"
})

.setTimestamp();

await message.channel.send({
embeds:[embed]
});

message.delete().catch(()=>{})

}

}