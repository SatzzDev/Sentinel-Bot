import { PermissionFlagsBits } from 'discord.js';

export default {
  name: 'access',
  description: 'Add or remove access to a channel for a user or role',
  async execute(message, args) {
    // Permission check
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply({
        components: [
          {
            type: 17,
            components: [
              { type: 10, content: "<:Close:1446440902276153489> You don't have permission to manage channels." }
            ]
          }
        ]
      });
    }

    // Step 0: Choose Action (Add or Remove)
    const msg = await message.reply({
      flags: 32768,
      components: [
        {
          type: 17,
          accent_color: 58878,
          spoiler: false,
          components: [
            {
              type: 10,
              content: "### <:Moderator:1446441028537024574> Channel Access Manager\nChoose an action"
            },
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 3,
                  custom_id: 'action_add',
                  emoji: { name: 'Unlock', id: '1446441182170448054' },
                  label: 'Add Access'
                },
                {
                  type: 2,
                  style: 4,
                  custom_id: 'action_remove',
                  emoji: { name: 'Lock', id: '1446441007205056603' },
                  label: 'Remove Access'
                }
              ]
            },
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 2,
                  custom_id: 'cancel_access',
                  label: 'Cancel'
                }
              ]
            }
          ]
        }
      ]
    });

    // Storage
    let action = null; // 'add' or 'remove'
    let selectedChannel = null;
    let selectedTarget = null;
    let targetType = null;
    let selectedPermissions = [];

    // Collector
    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 120000
    });

    collector.on('collect', async (i) => {
      try {
        // Step 0: Action Selected
        if (i.customId === 'action_add' || i.customId === 'action_remove') {
          await i.deferUpdate();
          action = i.customId === 'action_add' ? 'add' : 'remove';

          // Step 1: Select Channel
          await msg.edit({
            flags: 32768,
            components: [
              {
                type: 17,
                accent_color: 58878,
                spoiler: false,
                components: [
                  {
                    type: 10,
                    content: `### <:${action === 'add' ? 'Unlock' : 'Lock'}:${action === 'add' ? '1446441182170448054' : '1446441007205056603'}> ${action === 'add' ? 'Add' : 'Remove'} Channel Access\n**Step 1:** Select a channel`
                  },
                  {
                    type: 1,
                    components: [
                      {
                        type: 8,
                        custom_id: 'select_channel',
                        placeholder: 'Select a channel',
                        channel_types: [0, 2, 5]
                      }
                    ]
                  },
                  {
                    type: 1,
                    components: [
                      {
                        type: 2,
                        style: 2,
                        custom_id: 'back_to_action',
                        label: 'Back'
                      },
                      {
                        type: 2,
                        style: 2,
                        custom_id: 'cancel_access',
                        label: 'Cancel'
                      }
                    ]
                  }
                ]
              }
            ]
          });
        }

        // Step 1: Channel Selected
        if (i.customId === 'select_channel') {
          await i.deferUpdate();
          selectedChannel = i.channels.first();

          // Step 2: Select User or Role
          await msg.edit({
            flags: 32768,
            components: [
              {
                type: 17,
                accent_color: 58878,
                spoiler: false,
                components: [
                  {
                    type: 10,
                    content: `### <:${action === 'add' ? 'Unlock' : 'Lock'}:${action === 'add' ? '1446441182170448054' : '1446441007205056603'}> ${action === 'add' ? 'Add' : 'Remove'} Channel Access\n<:Pin:1446441068072800256> **Channel:** ${selectedChannel}\n\n**Step 2:** Select user or role`
                  },
                  {
                    type: 1,
                    components: [
                      {
                        type: 5,
                        custom_id: 'select_user',
                        placeholder: 'Select a user',
                        min_values: 1,
                        max_values: 1
                      }
                    ]
                  },
                  {
                    type: 1,
                    components: [
                      {
                        type: 6,
                        custom_id: 'select_role',
                        placeholder: 'Select a role'
                      }
                    ]
                  },
                  {
                    type: 1,
                    components: [
                      {
                        type: 2,
                        style: 2,
                        custom_id: 'back_to_channel',
                        label: 'Back'
                      },
                      {
                        type: 2,
                        style: 2,
                        custom_id: 'cancel_access',
                        label: 'Cancel'
                      }
                    ]
                  }
                ]
              }
            ]
          });
        }

        // Step 2: User Selected
        if (i.customId === 'select_user') {
          await i.deferUpdate();
          selectedTarget = i.users.first();
          targetType = 'user';

          if (action === 'remove') {
            // For remove, skip permission selection and go to confirm
            await msg.edit({
              flags: 32768,
              components: [
                {
                  type: 17,
                  accent_color: 58878,
                  spoiler: false,
                  components: [
                    {
                      type: 10,
                      content: `### <:Lock:1446441007205056603> Remove Channel Access\n<:Pin:1446441068072800256> **Channel:** ${selectedChannel}\n<:User:1446441184003096626> **Target:** ${selectedTarget}\n\n**Step 3:** Confirm to remove all access`
                    },
                    {
                      type: 1,
                      components: [
                        {
                          type: 2,
                          style: 2,
                          custom_id: 'back_to_target',
                          label: 'Back'
                        },
                        {
                          type: 2,
                          style: 2,
                          custom_id: 'cancel_access',
                          label: 'Cancel'
                        },
                        {
                          type: 2,
                          style: 4,
                          custom_id: 'confirm_remove',
                          label: 'Remove Access'
                        }
                      ]
                    }
                  ]
                }
              ]
            });
          } else {
            // Step 3: Select Permissions (for add only)
            await msg.edit({
              flags: 32768,
              components: [
                {
                  type: 17,
                  accent_color: 58878,
                  spoiler: false,
                  components: [
                    {
                      type: 10,
                      content: `### <:Unlock:1446441182170448054> Add Channel Access\n<:Pin:1446441068072800256> **Channel:** ${selectedChannel}\n<:User:1446441184003096626> **Target:** ${selectedTarget}\n\n**Step 3:** Select permissions to grant`
                    },
                    {
                      type: 1,
                      components: [
                        {
                          type: 3,
                          custom_id: 'select_permissions',
                          placeholder: 'Select permissions',
                          min_values: 1,
                          max_values: 5,
                          options: [
                            {
                              label: 'All Permissions',
                              value: 'all',
                              description: 'Grant all available permissions',
                              emoji: { name: 'Sparkles', id: '1446441135257030716' }
                            },
                            {
                              label: 'View Channel',
                              value: 'ViewChannel',
                              description: 'Allow to see the channel',
                              emoji: { name: 'Robot', id: '1446441088490541206' }
                            },
                            {
                              label: 'Send Messages',
                              value: 'SendMessages',
                              description: 'Allow to send messages',
                              emoji: { name: 'DoubleSpeech', id: '1446440925751414906' }
                            },
                            {
                              label: 'Read Message History',
                              value: 'ReadMessageHistory',
                              description: 'Allow to read past messages',
                              emoji: { name: 'Speech2', id: '1446441138637770824' }
                            },
                            {
                              label: 'Connect',
                              value: 'Connect',
                              description: 'Allow to join voice channels',
                              emoji: { name: 'Voice', id: '1446441191296991372' }
                            }
                          ]
                        }
                      ]
                    },
                    {
                      type: 1,
                      components: [
                        {
                          type: 2,
                          style: 2,
                          custom_id: 'back_to_target',
                          label: 'Back'
                        },
                        {
                          type: 2,
                          style: 2,
                          custom_id: 'cancel_access',
                          label: 'Cancel'
                        }
                      ]
                    }
                  ]
                }
              ]
            });
          }
        }

        // Step 2: Role Selected
        if (i.customId === 'select_role') {
          await i.deferUpdate();
          selectedTarget = i.roles.first();
          targetType = 'role';

          if (action === 'remove') {
            // For remove, skip permission selection
            await msg.edit({
              flags: 32768,
              components: [
                {
                  type: 17,
                  accent_color: 58878,
                  spoiler: false,
                  components: [
                    {
                      type: 10,
                      content: `### <:Lock:1446441007205056603> Remove Channel Access\n<:Pin:1446441068072800256> **Channel:** ${selectedChannel}\n<:User:1446441184003096626> **Target:** ${selectedTarget}\n\n**Step 3:** Confirm to remove all access`
                    },
                    {
                      type: 1,
                      components: [
                        {
                          type: 2,
                          style: 2,
                          custom_id: 'back_to_target',
                          label: 'Back'
                        },
                        {
                          type: 2,
                          style: 2,
                          custom_id: 'cancel_access',
                          label: 'Cancel'
                        },
                        {
                          type: 2,
                          style: 4,
                          custom_id: 'confirm_remove',
                          label: 'Remove Access'
                        }
                      ]
                    }
                  ]
                }
              ]
            });
          } else {
            // Step 3: Select Permissions
            await msg.edit({
              flags: 32768,
              components: [
                {
                  type: 17,
                  accent_color: 58878,
                  spoiler: false,
                  components: [
                    {
                      type: 10,
                      content: `### <:Unlock:1446441182170448054> Add Channel Access\n<:Pin:1446441068072800256> **Channel:** ${selectedChannel}\n<:User:1446441184003096626> **Target:** ${selectedTarget}\n\n**Step 3:** Select permissions to grant`
                    },
                    {
                      type: 1,
                      components: [
                        {
                          type: 3,
                          custom_id: 'select_permissions',
                          placeholder: 'Select permissions',
                          min_values: 1,
                          max_values: 5,
                          options: [
                            {
                              label: 'All Permissions',
                              value: 'all',
                              description: 'Grant all available permissions',
                              emoji: { name: 'Sparkles', id: '1446441135257030716' }
                            },
                            {
                              label: 'View Channel',
                              value: 'ViewChannel',
                              description: 'Allow to see the channel',
                              emoji: { name: 'Robot', id: '1446441088490541206' }
                            },
                            {
                              label: 'Send Messages',
                              value: 'SendMessages',
                              description: 'Allow to send messages',
                              emoji: { name: 'DoubleSpeech', id: '1446440925751414906' }
                            },
                            {
                              label: 'Read Message History',
                              value: 'ReadMessageHistory',
                              description: 'Allow to read past messages',
                              emoji: { name: 'Speech2', id: '1446441138637770824' }
                            },
                            {
                              label: 'Connect',
                              value: 'Connect',
                              description: 'Allow to join voice channels',
                              emoji: { name: 'Voice', id: '1446441191296991372' }
                            }
                          ]
                        }
                      ]
                    },
                    {
                      type: 1,
                      components: [
                        {
                          type: 2,
                          style: 2,
                          custom_id: 'back_to_target',
                          label: 'Back'
                        },
                        {
                          type: 2,
                          style: 2,
                          custom_id: 'cancel_access',
                          label: 'Cancel'
                        }
                      ]
                    }
                  ]
                }
              ]
            });
          }
        }

        // Step 3: Permissions Selected
        if (i.customId === 'select_permissions') {
          await i.deferUpdate();
          const values = i.values;

          if (values.includes('all')) {
            selectedPermissions = [
              'ViewChannel',
              'ManageChannels',
              'ManageRoles',
              'ManageWebhooks',
              'CreateInstantInvite',
              'SendMessages',
              'SendMessagesInThreads',
              'CreatePublicThreads',
              'CreatePrivateThreads',
              'EmbedLinks',
              'AttachFiles',
              'AddReactions',
              'UseExternalEmojis',
              'UseExternalStickers',
              'MentionEveryone',
              'ManageMessages',
              'ManageThreads',
              'ReadMessageHistory',
              'SendTTSMessages',
              'SendVoiceMessages',
              'Connect',
              'Speak',
              'Stream',
              'UseEmbeddedActivities',
              'UseSoundboard',
              'UseExternalSounds',
              'UseVAD',
              'PrioritySpeaker',
              'MuteMembers',
              'DeafenMembers',
              'MoveMembers'
            ];
          } else {
            selectedPermissions = values;
          }

          const permsList = selectedPermissions.map(p => {
            const emoji = {
              'ViewChannel': '<:Robot:1446441088490541206>',
              'SendMessages': '<:DoubleSpeech:1446440925751414906>',
              'ReadMessageHistory': '<:Speech2:1446441138637770824>',
              'Connect': '<:Voice:1446441191296991372>',
              'ManageChannels': '<:Settings:1446441118643388497>',
              'ManageRoles': '<:Moderator:1446441028537024574>',
              'ManageWebhooks': '<:Webhook:1446441210641533968>',
              'CreateInstantInvite': '<:Invite:1446441114869739520>',
              'SendMessagesInThreads': '<:Thread:1446441076322337042>',
              'CreatePublicThreads': '<:PublicThread:1446441213874569216>',
              'CreatePrivateThreads': '<:PrivateThread:1446441217085987840>',
              'EmbedLinks': '<:Link:1446441122521239040>',
              'AttachFiles': '<:Link:1446440997318951022>', 
              'AddReactions': '<:AddReaction:1446440857388585114>',
              'UseExternalEmojis': '<:Emoji:1446441100732344320>',
              'UseExternalStickers': '<:Sticker:1446441200346359040>',
              'MentionEveryone': '<:At:1446440870042800198>',
              'ManageMessages': '<:MessageSettings:1446441072528397318>',
              'ManageThreads': '<:ThreadSettings:1446441220347990016>', 
              'SendTTSMessages': '<:TTS:1446441159132339722>',
              'SendVoiceMessages': '<:VoiceMessage:1446441203579392104>',
              'Speak': '<:Speaker:1446441194518021120>',
              'Stream': '<:Live:1446441219998204682>',
              'UseEmbeddedActivities': '<:Activity:1446441223240138240>',
              'UseSoundboard': '<:Soundboard:1446441226472058880>',
              'UseExternalSounds': '<:ExternalSound:1446441230004067840>',
              'UseVAD': '<:VAD:1446441233112325125120>',
              'PrioritySpeaker': '<:PrioritySpeaker:1446441236321>',
              'MuteMembers': '<:MicrophoneMuted:1446441020563787917>',
              'DeafenMembers': '<:HeadsetMuted:1446440969213055026>',
              'MoveMembers': '<:Move:1446441246476707840>'
            };
            return `${emoji[p] || '•'} ${p}`;
          }).join('\n');

          // Step 4: Confirm
          await msg.edit({
            flags: 32768,
            components: [
              {
                type: 17,
                accent_color: 58878,
                spoiler: false,
                components: [
                  {
                    type: 10,
                    content: `### <:Unlock:1446441182170448054> Add Channel Access\n<:Pin:1446441068072800256> **Channel:** ${selectedChannel}\n<:User:1446441184003096626> **Target:** ${selectedTarget}\n<:Moderator:1446441028537024574> **Permissions:**\n${permsList}\n\n**Step 4:** Confirm to grant access`
                  },
                  {
                    type: 1,
                    components: [
                      {
                        type: 2,
                        style: 2,
                        custom_id: 'back_to_permissions',
                        label: 'Back'
                      },
                      {
                        type: 2,
                        style: 2,
                        custom_id: 'cancel_access',
                        label: 'Cancel'
                      },
                      {
                        type: 2,
                        style: 3,
                        custom_id: 'confirm_access',
                        label: 'Grant Access'
                      }
                    ]
                  }
                ]
              }
            ]
          });
        }

        // Back to Action Selection
        if (i.customId === 'back_to_action') {
          await i.deferUpdate();
          action = null;
          selectedChannel = null;
          selectedTarget = null;
          targetType = null;
          selectedPermissions = [];

          await msg.edit({
            flags: 32768,
            components: [
              {
                type: 17,
                accent_color: 58878,
                spoiler: false,
                components: [
                  {
                    type: 10,
                    content: "### <:Moderator:1446441028537024574> Channel Access Manager\nChoose an action"
                  },
                  {
                    type: 1,
                    components: [
                      {
                        type: 2,
                        style: 3,
                        custom_id: 'action_add',
                        emoji: { name: 'Unlock', id: '1446441182170448054' },
                        label: 'Add Access'
                      },
                      {
                        type: 2,
                        style: 4,
                        custom_id: 'action_remove',
                        emoji: { name: 'Lock', id: '1446441007205056603' },
                        label: 'Remove Access'
                      }
                    ]
                  },
                  {
                    type: 1,
                    components: [
                      {
                        type: 2,
                        style: 2,
                        custom_id: 'cancel_access',
                        label: 'Cancel'
                      }
                    ]
                  }
                ]
              }
            ]
          });
        }

        // Back to Channel Selection
        if (i.customId === 'back_to_channel') {
          await i.deferUpdate();
          selectedChannel = null;
          selectedTarget = null;
          targetType = null;
          selectedPermissions = [];

          await msg.edit({
            flags: 32768,
            components: [
              {
                type: 17,
                accent_color: 58878,
                spoiler: false,
                components: [
                  {
                    type: 10,
                    content: `### <:${action === 'add' ? 'Unlock' : 'Lock'}:${action === 'add' ? '1446441182170448054' : '1446441007205056603'}> ${action === 'add' ? 'Add' : 'Remove'} Channel Access\n**Step 1:** Select a channel`
                  },
                  {
                    type: 1,
                    components: [
                      {
                        type: 8,
                        custom_id: 'select_channel',
                        placeholder: 'Select a channel',
                        channel_types: [0, 2, 5]
                      }
                    ]
                  },
                  {
                    type: 1,
                    components: [
                      {
                        type: 2,
                        style: 2,
                        custom_id: 'back_to_action',
                        label: 'Back'
                      },
                      {
                        type: 2,
                        style: 2,
                        custom_id: 'cancel_access',
                        label: 'Cancel'
                      }
                    ]
                  }
                ]
              }
            ]
          });
        }

        // Back to Target Selection
        if (i.customId === 'back_to_target') {
          await i.deferUpdate();
          selectedTarget = null;
          targetType = null;
          selectedPermissions = [];

          await msg.edit({
            flags: 32768,
            components: [
              {
                type: 17,
                accent_color: 58878,
                spoiler: false,
                components: [
                  {
                    type: 10,
                    content: `### <:${action === 'add' ? 'Unlock' : 'Lock'}:${action === 'add' ? '1446441182170448054' : '1446441007205056603'}> ${action === 'add' ? 'Add' : 'Remove'} Channel Access\n<:Pin:1446441068072800256> **Channel:** ${selectedChannel}\n\n**Step 2:** Select user or role`
                  },
                  {
                    type: 1,
                    components: [
                      {
                        type: 5,
                        custom_id: 'select_user',
                        placeholder: 'Select a user',
                        min_values: 1,
                        max_values: 1
                      }
                    ]
                  },
                  {
                    type: 1,
                    components: [
                      {
                        type: 6,
                        custom_id: 'select_role',
                        placeholder: 'Select a role'
                      }
                    ]
                  },
                  {
                    type: 1,
                    components: [
                      {
                        type: 2,
                        style: 2,
                        custom_id: 'back_to_channel',
                        label: 'Back'
                      },
                      {
                        type: 2,
                        style: 2,
                        custom_id: 'cancel_access',
                        label: 'Cancel'
                      }
                    ]
                  }
                ]
              }
            ]
          });
        }

        // Back to Permission Selection
        if (i.customId === 'back_to_permissions') {
          await i.deferUpdate();
          selectedPermissions = [];

          await msg.edit({
            flags: 32768,
            components: [
              {
                type: 17,
                accent_color: 58878,
                spoiler: false,
                components: [
                  {
                    type: 10,
                    content: `### <:Unlock:1446441182170448054> Add Channel Access\n<:Pin:1446441068072800256> **Channel:** ${selectedChannel}\n<:User:1446441184003096626> **Target:** ${selectedTarget}\n\n**Step 3:** Select permissions to grant`
                  },
                  {
                    type: 1,
                    components: [
                      {
                        type: 3,
                        custom_id: 'select_permissions',
                        placeholder: 'Select permissions',
                        min_values: 1,
                        max_values: 5,
                        options: [
                          {
                            label: 'All Permissions',
                            value: 'all',
                            description: 'Grant all available permissions',
                            emoji: { name: 'Sparkles', id: '1446441135257030716' }
                          },
                          {
                            label: 'View Channel',
                            value: 'ViewChannel',
                            description: 'Allow to see the channel',
                            emoji: { name: 'Robot', id: '1446441088490541206' }
                          },
                          {
                            label: 'Send Messages',
                            value: 'SendMessages',
                            description: 'Allow to send messages',
                            emoji: { name: 'DoubleSpeech', id: '1446440925751414906' }
                          },
                          {
                            label: 'Read Message History',
                            value: 'ReadMessageHistory',
                            description: 'Allow to read past messages',
                            emoji: { name: 'Speech2', id: '1446441138637770824' }
                          },
                          {
                            label: 'Connect',
                            value: 'Connect',
                            description: 'Allow to join voice channels',
                            emoji: { name: 'Voice', id: '1446441191296991372' }
                          }
                        ]
                      }
                    ]
                  },
                  {
                    type: 1,
                    components: [
                      {
                        type: 2,
                        style: 2,
                        custom_id: 'back_to_target',
                        label: 'Back'
                      },
                      {
                        type: 2,
                        style: 2,
                        custom_id: 'cancel_access',
                        label: 'Cancel'
                      }
                    ]
                  }
                ]
              }
            ]
          });
        }

        // Cancel
        if (i.customId === 'cancel_access') {
          await i.deferUpdate();
          await msg.edit({
            components: [
              {
                type: 17,
                components: [
                  { type: 10, content: "<:Close:1446440902276153489> **Action cancelled.**" }
                ]
              }
            ]
          });
          collector.stop('cancelled');
        }

        // Confirm - Grant Access
        if (i.customId === 'confirm_access') {
          await i.deferUpdate();

          await msg.edit({
            components: [
              {
                type: 17,
                components: [
                  { type: 10, content: "<:Time:1446441167766945843> **Granting access...**" }
                ]
              }
            ]
          });

          try {
            const permissions = {};
            selectedPermissions.forEach(perm => {
              permissions[perm] = true;
            });

            await selectedChannel.permissionOverwrites.edit(selectedTarget.id, permissions);

            const permsList = selectedPermissions.map(p => {
              const emoji = {
                'ViewChannel': '<:Robot:1446441088490541206>',
                'SendMessages': '<:DoubleSpeech:1446440925751414906>',
                'ReadMessageHistory': '<:Speech2:1446441138637770824>',
                'Connect': '<:Voice:1446441191296991372>'
              };
              return `${emoji[p] || '•'} ${p}`;
            }).join('\n');

            await msg.edit({
              components: [
                {
                  type: 17,
                  accent_color: 5763719,
                  spoiler: false,
                  components: [
                    {
                      type: 10,
                      content: `### <:Check:1446440889646846004> Access granted!\n<:Pin:1446441068072800256> **Channel:** ${selectedChannel}\n<:User:1446441184003096626> **Target:** ${selectedTarget}\n<:Moderator:1446441028537024574> **Permissions:**\n${permsList}`
                    }
                  ]
                }
              ]
            });

            collector.stop('success');
          } catch (err) {
            console.error(err);
            await msg.edit({
              components: [
                {
                  type: 17,
                  components: [
                    { type: 10, content: `<:Close:1446440902276153489> **Failed to grant access:** \`${err.message}\`` }
                  ]
                }
              ]
            });
            collector.stop('error');
          }
        }

        // Confirm - Remove Access
        if (i.customId === 'confirm_remove') {
          await i.deferUpdate();

          await msg.edit({
            components: [
              {
                type: 17,
                components: [
                  { type: 10, content: "<:Time:1446441167766945843> **Removing access...**" }
                ]
              }
            ]
          });

          try {
            await selectedChannel.permissionOverwrites.delete(selectedTarget.id);

            await msg.edit({
              components: [
                {
                  type: 17,
                  accent_color: 15158332,
                  spoiler: false,
                  components: [
                    {
                      type: 10,
                      content: `### <:Lock:1446441007205056603> Access removed!\n<:Pin:1446441068072800256> **Channel:** ${selectedChannel}\n<:User:1446441184003096626> **Target:** ${selectedTarget}`
                    }
                  ]
                }
              ]
            });

            collector.stop('removed');
          } catch (err) {
            console.error(err);
            await msg.edit({
              components: [
                {
                  type: 17,
                  components: [
                    { type: 10, content: `<:Close:1446440902276153489> **Failed to remove access:** \`${err.message}\`` }
                  ]
                }
              ]
            });
            collector.stop('error');
          }
        }

      } catch (error) {
        console.error(error);
      }
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'time') {
        try {
          await msg.edit({
            components: [
              {
                type: 17,
                components: [
                  { type: 10, content: "<:Time:1446441167766945843> **Interaction timeout** - Command expired." }
                ]
              }
            ]
          });
        } catch (err) {
          console.error('Error on timeout:', err);
        }
      }
    });
  },
};