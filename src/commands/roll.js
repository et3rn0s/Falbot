const { MessageEmbed } = require("discord.js")
const Roll = require("roll")
const { getRoleColor } = require("../utils/functions.js")
const { testOnly } = require("../config.json")

module.exports = {
	category: "Fun",
	description: "Roll dice for you",
	slash: true,
	cooldown: "1s",
	guildOnly: true,
	testOnly,
	options: [
		{
			name: "dice",
			description: "dice to be rolled",
			required: true,
			type: "STRING",
		},
	],
	callback: async ({ instance, guild, interaction, user, text }) => {
		try {
			const roll = new Roll()
			text = text.replace(/\s/g, "")

			if (!roll.validate(text)) {
				return instance.messageHandler.get(guild, "VALOR_INVALIDO", {
					VALUE: text,
				})
			} else {
				rolled = roll.roll(text).result
				rolled = rolled.toString()

				embed = new MessageEmbed()
					.setColor(await getRoleColor(guild, user.id))
					.addFields(
						{
							name: "🎲:",
							value: text,
							inline: false,
						},
						{
							name: instance.messageHandler.get(guild, "RESULTADO"),
							value: `**${rolled}**`,
							inline: false,
						}
					)
					.setFooter({ text: "by Falcão ❤️" })
				interaction.reply({
					embeds: [embed],
				})
			}
		} catch (error) {
			console.error(`roll: ${error}`)
		}
	},
}
