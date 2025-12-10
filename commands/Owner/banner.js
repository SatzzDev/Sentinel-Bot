import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  name: "banner",
  owner: true,
  data: new SlashCommandBuilder()
    .setName("banner")
    .setDescription("Animated banner for your discord bot")
    .addAttachmentOption((option) =>
      option
        .setName("banner")
        .setDescription("Image banner to anime!")
        .setRequired(true)
    ),

  async execute(interaction, args, client) {
    const { options } = interaction;
    const bannerAttachment = options.getAttachment("banner");

    if (bannerAttachment.contentType !== "image/gif") {
      const embed = new EmbedBuilder().setDescription(
        "Please use a gif for the animated banner."
      );
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      await interaction.client.user.setBanner(bannerAttachment.url);
      const embed = new EmbedBuilder().setDescription(
        "I've uploaded the animated banner!"
      );
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.log(error);
      const embed = new EmbedBuilder().setDescription(
        `Error: \`${error.toString()}\``
      );
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
