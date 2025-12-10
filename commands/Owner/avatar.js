import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  name: "avatar",
  owner: true,
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Animated avatar for your discord bot")
    .addAttachmentOption((option) =>
      option
        .setName("avatar")
        .setDescription("Image avatar to anime!")
        .setRequired(true)
    ),

  async execute(interaction, args, client) {
    const { options } = interaction;
    const avatar = options.getAttachment("avatar");

    if (avatar.contentType !== "image/gif") {
      const embed = new EmbedBuilder().setDescription(
        "Please use a gif for the animated pfp."
      );
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      await interaction.client.user.setAvatar(avatar.url);
      const embed = new EmbedBuilder().setDescription("I`ve uploaded the pfp!");
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
