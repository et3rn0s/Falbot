const { msToTime, format } = require('../../utils/functions.js');
require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vote')
		.setNameLocalizations({
			'pt-BR': 'voto',
			'es-ES': 'voto',
		})
		.setDescription('Earn falcoins by voting for us on top.gg')
		.setDescriptionLocalizations({
			'pt-BR': 'Ganhe falcois votando no bot no top.gg',
			'es-ES': 'Gana falcoins votando por nosotros en top.gg',
		}),
	execute: async ({ user, instance, interaction, database }) => {
		try {
			await interaction.deferReply().catch(() => {});

			var request = await fetch(`https://top.gg/api/bots/check?userId=${user.id}`, {
				method: 'GET',
				headers: {
					Authorization: process.env.Authorization,
				},
			});

			var voted = (await request.json()).voted;
			const player = await database.player.findOne(user.id);
			var reward = instance.levels[player.rank - 1].vote;
			const bonus = Math.min(player.voteStreak, 30) * 5;

			if (Date.now() - player.lastVote > 1000 * 60 * 60 * 48) {
				player.voteStreak = 0;
			}

			if (voted && Date.now() - player.lastVote > 1000 * 60 * 60 * 12) {
				player.lastVote = Date.now();
				player.voteStreak++;
				player.falcoins += reward + (reward * bonus) / 100;
				var embed = instance.createEmbed(3066993).addFields({
					name: instance.getMessage(interaction, 'VOTE_THANKS'),
					value:
						bonus != 150
							? instance.getMessage(interaction, 'VOTE_COLLECTED', {
									REWARD: format(reward),
									PERCENTAGE: bonus,
							  })
							: instance.getMessage(interaction, 'VOTE_COLLECTED_MAX', {
									REWARD: format(reward),
									PERCENTAGE: bonus,
							  }),
				});
				player.stats.set('timesVoted', player.stats.get('timesVoted') + 1);
			} else if (voted && Date.now() - player.lastVote < 1000 * 60 * 60 * 12) {
				var embed = instance.createEmbed(15158332).addFields({
					name: instance.getMessage(interaction, 'ALREADY_COLLECTED'),
					value: instance.getMessage(interaction, 'ALREADY_COLLECTED2', {
						TIME: msToTime(1000 * 60 * 60 * 12 - (Date.now() - player.lastVote)),
						REWARD: format(reward),
					}),
				});
			} else {
				var embed = instance
					.createEmbed('#0099ff')
					.addFields({
						name: instance.getMessage(interaction, 'VOTE_FIRST'),
						value: instance.getMessage(interaction, 'VOTE_DESCRIPTION', {
							FALCOINS: format(reward),
						}),
					})
					.addFields({
						name: instance.getMessage(interaction, 'VOTE_HERE'),
						value:
							'https://top.gg/bot/742331813539872798/vote\n\n' +
							instance.getMessage(interaction, 'VOTE_FINAL', {
								PERCENTAGE: bonus,
							}),
					});
			}
			await instance.editReply(interaction, { embeds: [embed] });
			player.save();
		} catch (error) {
			console.error(`vote: ${error}`);
			instance.editReply(interaction, {
				content: instance.getMessage(interaction, 'EXCEPTION'),
				embeds: [],
			});
		}
	},
};
