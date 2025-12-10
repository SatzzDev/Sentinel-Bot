import { PermissionFlagsBits } from "discord.js";
import util from "util";

export default {
name: "purge",
description: "Purge messages or reset the channel with confirmation.",
async execute(message, args, client) {
// Permission check
if (
!message.member.permissions.has(PermissionFlagsBits.ManageChannels) &&
!message.member.permissions.has(PermissionFlagsBits.ManageMessages)
) {
return message.reply({
  components: [
    {
      type: 17,
      components: [
        { type: 10, content: "<:Close:1446440902276153489> You don't have the required permissions." }
      ]
    }
  ]
});
}

const targetChannel = message.mentions.channels.first() || message.channel;
// Send initial message
const msg = await message.reply({
"flags": 32768,
"components": [
{
"type": 17,
"accent_color": 58878,
"spoiler": false,
"components": [
{
"type": 10,
"content": "### <:Paint:1446441057041780777> Choose purge action for this channel"
},
{
"type": 1,
"components": [
{
"style": 2,
"type": 2,
"custom_id": "purge_cancel",
"emoji": {
"id": "1446440902276153489",
"name": "Close",
"animated": false
},
"label": "Cancel"
},
{
"style": 2,
"type": 2,
"custom_id": "purge_100",
"emoji": {
"id": "1446441169830805665",
"name": "Trash",
"animated": false
},
"label": "Clear"
},
{
"style": 2,
"type": 2,
"custom_id": "purge_reset",
"emoji": {
"id": "1446441082442219583",
"name": "Refresh",
"animated": false
},
"label": "Reset"
}
]
}
]
}
]
});

// Collector for interactions
const collector = msg.createMessageComponentCollector({
filter: (i) => i.user.id === message.author.id,
time: 60000, // 60 seconds
});

collector.on("collect", async (i) => {
try {
await i.deferUpdate();

// Cancel action
if (i.customId === "purge_cancel") {
collector.stop("cancelled");
return msg.edit({
  components: [
    {
      type: 17,
      components: [
        { type: 10, content: "<:Check:1446440889646846004> **Action cancelled.**" }
      ]
    }
  ]
});
}

// Show confirmation
if (i.customId === "purge_reset" || i.customId === "purge_100") {
const action = i.customId;
const actionText =
action === "purge_reset" ? "Reset Channel" : "Delete 100 Messages";

return msg.edit(
  {
    flags: 32768,
    components: [
      {
        type: 17,
        accent_color: 58878,
        spoiler: false,
        components: [
          {
            type: 10,
            content: `<:Exclamation:1446440943048720595> **Confirm action for** ${targetChannel}\n\`${actionText}\``
          },
          {
            type: 1,
            components: [
              {
                style: 2,
                type: 2,
                custom_id: "purge_back",
                emoji: {
                  id: "1446441086427074631>",
                  name: "Reply",
                  animated: false
                },
                label: "Back"
              },
              {
                style: 2,
                type: 2,
                custom_id: "purge_cancel",
                emoji: {
                  id: "1446440902276153489",
                  name: "Close",
                  animated: false
                },
                label: "Cancel"
              },
              {
                style: 2,
                type: 2,
                custom_id: `${action}_confirm`,
                emoji: {
                  id: "1446440889646846004",
                  name: "Check",
                  animated: false
                },
                label: "Confirm"
              }
            ]
          }
        ]
      }
    ]
  }
);
}

// Back button - return to main menu
if (i.customId === "purge_back") {
  return msg.edit({
    components: [
      {
        type: 17,
        components: [
          { type: 10, content: `# <:Paint:1446441057041780777> Choose purge action for channel:` },
        ],
      },
      {
        type: 17,
        components: [
          { type: 10, content: `${targetChannel}` },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 2,
            custom_id: "purge_reset",
            emoji: {
              id: "1446441082442219583",
              name: "Refresh",
              animated: false,
            },
            label: "Reset",
          },
          {
            type: 2,
            style: 2,
            custom_id: "purge_100",
            emoji: {
              id: "1446441169830805665",
              name: "Trash",
              animated: false,
            },
            label: "Clear",
          },
          {
            type: 2,
            style: 2,
            custom_id: "purge_cancel",
            emoji: {
              id: "1446440902276153489",
              name: "Close",
              animated: false,
            },
            label: "Cancel",
          },
        ],
      },
    ],
  });
}

// Execute: Reset Channel
if (i.customId === "purge_reset_confirm") {
  await msg.edit({
    components: [
      {
        type: 17,
        components: [
          { type: 10, content: `# <:Refresh:1446441082442219583> **Resetting channel...**` },
        ],
      },
      {
        type: 17,
        components: [
          { type: 10, content: `${targetChannel}` },
        ],
      }
    ],
  });

  try {
    const old = targetChannel;
    const clone = await old.clone({
      reason: `Channel Reset by ${message.author.tag}`,
    });

    await clone.setPosition(old.position);

    await clone.send({
      components: [
        {
          type: 17,
          components: [
            { type: 10, content: `# <:Check:1446440889646846004> **Channel reset successfully**` },
          ],
        },
      ],
    });

    await old.delete();
    collector.stop("reset_complete");
  } catch (error) {
    console.error(util.format(error));
    await msg.edit({
      components: [
        {
          type: 17,
          components: [
            { type: 10, content: `#<:Close:1446440902276153489> **Failed to reset channel**\n\`${error.message}\`` },
          ],
        },
      ],
    });
    collector.stop("error");
  }
}

// Execute: Delete 100 Messages
if (i.customId === "purge_100_confirm") {
await msg.edit({
  components: [
    {
      type: 17,
      components: [
        { type: 10, content: `# <:Trash:1446441169830805665> **Deleting messages...**` }
      ]
    }
  ],
});

try {
  const fetched = await targetChannel.messages.fetch({ limit: 100 });
  const deleted = await targetChannel.bulkDelete(fetched, true);

  await msg.edit({
    components: [
      {
        type: 17,
        components: [
          { type: 10, content: `# <:Check:1446440889646846004> **Successfully deleted \`${deleted.size}\` messages**` },
          { type: 10, content: `Channel: ${targetChannel}` },
          { type: 10, content: `Moderator: ${message.author}` }
        ]
      }
    ],
  });

  collector.stop("delete_complete");
} catch (error) {
  console.error(util.format(error));
  await msg.edit({
    components: [
      {
        type: 17,
        components: [
          { type: 10, content: `# <:Close:1446440902276153489> **Failed to delete messages**\n\`${error.message}\`` }
        ]
      }
    ],
  });
  collector.stop("error");
}
}
} catch (error) {
console.error(util.format(error));
}
});

collector.on("end", async (_, reason) => {
if (reason === "time") {
try {
await msg.edit({
  components: [
    {
      type: 17,
      components: [
        { type: 10, content: "# <:Close:1446440902276153489> **Interaction timeout** - Command expired." }
      ]
    }
  ],
});
} catch {
console.error(util.format(error));
}
}
});
},
};
