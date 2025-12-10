# Sentinel Bot

Sentinel Bot is a multi-purpose Discord bot designed for moderation, music playback, utilities, and more. It is built with modular commands and supports various functionalities aimed at enhancing your Discord server experience.

## Features

- **Moderation:** Kick, ban, timeout, purge messages, warn users, and manage nicknames.
- **Music:** Play, pause, skip, shuffle songs with filters and seek capabilities.
- **Utility:** Fetch server info, simulate commands, add emojis, Google search, and more.
- **Information:** Provide bot statistics, user info, ping, and localized content like gempa (earthquake info).
- **Owner Commands:** Change bot avatar, set banner images.
- Modular and extensible command structure for easy addition of new features.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/SatzzDev/Sentinel-Bot.git
   cd Sentinel-Bot
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a configuration file:

   Copy `config.example.js` to `config.js` and edit it with your bot token and other settings.

   ```bash
   cp config.example.js config.js
   ```

4. Run the bot:

   ```bash
   node index.js
   ```

## Usage

Invite the bot to your Discord server and use the prefix commands. For example:

```plaintext
!help            - Shows help menu
!play <song>     - Play a song
!ban <user>      - Ban a user
!serverinfo      - Show server information
```

Refer to the individual command files inside the `commands/` directory for complete usage details.

## Development

- Code is structured into commands by category for clarity.
- Music functionality is handled in the `commands/Music/` folder.
- Moderation commands found in `commands/Moderation/`.
- Utility commands under `commands/Utility/`.
- Owner-level commands for bot customization under `commands/Owner/`.
- Core libraries are in the `lib/` directory.

Feel free to contribute by opening issues or pull requests.

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please open an issue on the GitHub repository.
