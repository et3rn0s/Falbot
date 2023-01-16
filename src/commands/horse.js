const { MessageEmbed } = require("discord.js")
const {
	specialArg,
	readFile,
	getRoleColor,
	randint,
	changeDB,
	format,
} = require("../utils/functions.js")
const { testOnly } = require("../config.json")

module.exports = {
	category: "Economia",
	description: "bet in what horse is going to win",
	slash: true,
	cooldown: "1s",
	guildOnly: true,
	testOnly,
	options: [
		{
			name: "horse",
			description:
				"number of the horse you want to bet in, order is top to bottom",
			required: true,
			type: "NUMBER",
			choices: [
				{ name: 1, value: 1 },
				{ name: 2, value: 2 },
				{ name: 3, value: 3 },
				{ name: 4, value: 4 },
				{ name: 5, value: 5 },
			],
		},
		{
			name: "falcoins",
			description:
				'the amount of falcoins you want to bet (supports "all"/"half" and things like 50.000, 20%, 10M, 25B)',
			required: true,
			type: "STRING",
		},
	],
	callback: async ({ instance, guild, interaction, user, args }) => {
		try {
			await interaction.deferReply()
			try {
				var bet = await specialArg(args[1], user.id, "falcoins")
			} catch {
				await interaction.editReply({
					content: instance.messageHandler.get(guild, "VALOR_INVALIDO", {
						VALUE: args[1],
					}),
				})
				return
			}
			if ((await readFile(user.id, "falcoins")) >= bet && bet > 0) {
				await changeDB(user.id, "falcoins", -bet)
				const horses = [
					"- - - - -",
					"- - - - -",
					"- - - - -",
					"- - - - -",
					"- - - - -",
				]
				const embed = new MessageEmbed()
					.setDescription(
						instance.messageHandler.get(guild, "CAVALO_DESCRIPTION", {
							BET: await format(bet),
							HORSE: args[0],
						})
					)
					.addFields({
						name: "\u200b",
						value: `**1.** :checkered_flag:  ${horses[0]} :horse_racing:\n\u200b\n**2.** :checkered_flag:  ${horses[1]} :horse_racing:\n\u200b\n**3.** :checkered_flag:  ${horses[2]} :horse_racing:\n\u200b\n**4.** :checkered_flag:  ${horses[3]} :horse_racing:\n\u200b\n**5.** :checkered_flag:  ${horses[4]}  :horse_racing:`,
					})
					.setColor(await getRoleColor(guild, user.id))
					.setFooter({ text: "by Falcão ❤️" })

				await interaction.editReply({
					embeds: [embed],
				})

				for (let i = 0; i <= 21; i++) {
					let run = randint(0, 4)
					horses[run] = horses[run].slice(0, -2)

					embed.fields[0] = {
						name: "\u200b",
						value: `**1.** :checkered_flag:  ${horses[0]} :horse_racing:\n\u200b\n**2.** :checkered_flag:  ${horses[1]} :horse_racing:\n\u200b\n**3.** :checkered_flag:  ${horses[2]} :horse_racing:\n\u200b\n**4.** :checkered_flag:  ${horses[3]} :horse_racing:\n\u200b\n**5.** :checkered_flag:  ${horses[4]} :horse_racing:`,
					}
					await interaction.editReply({
						embeds: [embed],
					})

					if (horses[run] === "") {
						var winner = String(run + 1)
						break
					}

					await new Promise((resolve) => setTimeout(resolve, 250))
				}

				if (args[0] == winner) {
					await changeDB(user.id, "falcoins", bet * 5)
					embed.setColor(3066993).setDescription(
						instance.messageHandler.get(guild, "CAVALO_DESCRIPTION_WON", {
							BET: await format(bet),
							HORSE: args[0],
							FALCOINS: await format(bet * 5),
							SALDO: await readFile(user.id, "falcoins", true),
						})
					)
				} else {
					embed.setColor(15158332).setDescription(
						instance.messageHandler.get(guild, "CAVALO_DESCRIPTION_LOST", {
							BET: await format(bet),
							HORSE: args[0],
							SALDO: await readFile(user.id, "falcoins", true),
						})
					)
				}

				await interaction.editReply({
					embeds: [embed],
				})
			} else {
				await interaction.editReply({
					content: instance.messageHandler.get(guild, "FALCOINS_INSUFICIENTES"),
				})
			}
		} catch (error) {
			console.error(`horse: ${error}`)
		}
	},
}
