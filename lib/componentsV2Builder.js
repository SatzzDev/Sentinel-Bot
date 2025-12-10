import {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  SeparatorBuilder,
  AttachmentBuilder,
} from "discord.js";

// Discord Limits
const LIMITS = {
  TEXT_CONTENT: 4000,
  BUTTON_LABEL: 80,
  SELECT_LABEL: 100,
  SELECT_DESCRIPTION: 100,
  SELECT_VALUE: 100,
  SELECT_PLACEHOLDER: 150,
  BUTTONS_PER_ROW: 5,
  SELECT_OPTIONS: 25,
  ACTION_ROWS: 5,
};

/**
 * Parse emoji from various formats
 * @param {string|object} emoji - Emoji input
 * @returns {object|null} Parsed emoji object
 */
const parseEmoji = (emoji) => {
  if (!emoji) return null;

  // Already object format
  if (typeof emoji === "object" && emoji.name) {
    return emoji.id ? { name: emoji.name, id: emoji.id } : { name: emoji.name };
  }

  // String format
  if (typeof emoji === "string") {
    const trimmed = emoji.trim();
    if (!trimmed) return null;

    // Custom emoji: <:name:id> or <a:name:id>
    const customMatch = trimmed.match(/<a?:(\w+):(\d+)>/);
    if (customMatch) {
      return { name: customMatch[1], id: customMatch[2] };
    }

    // Unicode emoji
    const emojiRegex = /\p{Emoji}/u;
    if (emojiRegex.test(trimmed)) {
      return { name: trimmed };
    }

    // Plain text as emoji name (fallback for custom emoji by name)
    if (/^[\w_]+$/.test(trimmed)) {
      return { name: trimmed };
    }
  }

  return null;
};

/**
 * Truncate text to fit Discord limits
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add when truncated
 * @returns {string} Truncated text
 */
const truncateText = (text, maxLength, suffix = "...") => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Validate and sanitize button configuration
 * @param {object} btnConfig - Button configuration
 * @returns {object} Sanitized button config
 */
const sanitizeButton = (btnConfig) => {
  const sanitized = { ...btnConfig };

  // Truncate label
  if (sanitized.label) {
    sanitized.label = truncateText(sanitized.label, LIMITS.BUTTON_LABEL);
  }

  // Validate custom_id for non-link buttons
  if (!sanitized.url && !sanitized.id) {
    console.warn("⚠️ Button missing custom_id, generating random one");
    sanitized.id = `btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Validate style
  if (sanitized.url && sanitized.style && sanitized.style !== "link") {
    console.warn("⚠️ URL buttons must use 'link' style, auto-correcting");
    delete sanitized.style;
  }

  return sanitized;
};

/**
 * Validate and sanitize select menu option
 * @param {object} opt - Select option
 * @returns {object} Sanitized option
 */
const sanitizeSelectOption = (opt) => {
  const sanitized = {
    label: truncateText(opt.label || "Option", LIMITS.SELECT_LABEL),
    value: truncateText(opt.value || opt.label || `opt_${Date.now()}`, LIMITS.SELECT_VALUE),
  };

  if (opt.description) {
    sanitized.description = truncateText(opt.description, LIMITS.SELECT_DESCRIPTION);
  }

  if (opt.emoji) {
    const parsed = parseEmoji(opt.emoji);
    if (parsed) sanitized.emoji = parsed;
  }

  if (opt.default !== undefined) {
    sanitized.default = Boolean(opt.default);
  }

  return sanitized;
};

/**
 * Build Discord message components from configuration
 * @param {...object} conf - Component configurations (array or spread)
 * @returns {object} { container, attachments }
 */
export const buildMessageComponents = (...input) => {
  // Kalau input cuma 1 elemen dan itu array, maka pakai array itu
  // Kalau bukan array, anggap sebagai 1 komponen dalam array
  const config = (input.length === 1 && Array.isArray(input[0]))
    ? input[0]
    : input;
  
  const container = new ContainerBuilder();
  const attachments = [];
  let actionRowCount = 0;

  for (const item of config) {
    if (!item || !item.type) {
      console.warn("⚠️ Skipping invalid component:", item);
      continue;
    }

    try {
      switch (item.type) {
        case "section": {
          const section = new SectionBuilder();

          // Add text displays
          if (item.texts && Array.isArray(item.texts)) {
            item.texts.forEach((txt) => {
              if (txt) {
                const truncated = truncateText(txt, LIMITS.TEXT_CONTENT);
                section.addTextDisplayComponents((t) => t.setContent(truncated));
              }
            });
          }

          // Add button accessory
          if (item.button) {
            const sanitized = sanitizeButton(item.button);
            section.setButtonAccessory((btn) => {
              if (sanitized.id) btn.setCustomId(sanitized.id);
              if (sanitized.label) btn.setLabel(sanitized.label);

              if (sanitized.emoji) {
                const parsed = parseEmoji(sanitized.emoji);
                if (parsed) btn.setEmoji(parsed);
              }

              if (sanitized.url) {
                btn.setURL(sanitized.url).setStyle(ButtonStyle.Link);
              } else {
                const styleMap = {
                  primary: ButtonStyle.Primary,
                  secondary: ButtonStyle.Secondary,
                  success: ButtonStyle.Success,
                  danger: ButtonStyle.Danger,
                  link: ButtonStyle.Link,
                };
                btn.setStyle(styleMap[sanitized.style] || ButtonStyle.Secondary);
              }

              if (sanitized.disabled) btn.setDisabled(true);

              return btn;
            });
          }

          // Add thumbnail accessory
          if (item.thumbnail) {
            const thumbUrl = item.thumbnail.url || item.thumbnail;

            if (typeof thumbUrl === "string") {
              // Handle attachment URLs
              if (thumbUrl.startsWith("attachment://")) {
                const filename = thumbUrl.replace("attachment://", "");
                if (item.thumbnail.buffer) {
                  attachments.push(
                    new AttachmentBuilder(item.thumbnail.buffer, { name: filename })
                  );
                }
              }

              section.setThumbnailAccessory((t) => t.setURL(thumbUrl));
            }
          }

          container.addSectionComponents(section);
          break;
        }

        case "buttons": {
          if (!item.buttons || !Array.isArray(item.buttons)) {
            console.warn("⚠️ Buttons component missing buttons array");
            break;
          }

          // Limit buttons per row
          const buttons = item.buttons.slice(0, LIMITS.BUTTONS_PER_ROW);
          
          if (item.buttons.length > LIMITS.BUTTONS_PER_ROW) {
            console.warn(`⚠️ Too many buttons (${item.buttons.length}), limiting to ${LIMITS.BUTTONS_PER_ROW}`);
          }

          const btns = buttons.map((btnConfig) => {
            const sanitized = sanitizeButton(btnConfig);
            const b = new ButtonBuilder();

            if (sanitized.id) b.setCustomId(sanitized.id);
            if (sanitized.label) b.setLabel(sanitized.label);

            if (sanitized.emoji) {
              const parsed = parseEmoji(sanitized.emoji);
              if (parsed) b.setEmoji(parsed);
            }

            if (sanitized.url) {
              b.setURL(sanitized.url).setStyle(ButtonStyle.Link);
            } else {
              const styleMap = {
                primary: ButtonStyle.Primary,
                secondary: ButtonStyle.Secondary,
                success: ButtonStyle.Success,
                danger: ButtonStyle.Danger,
              };
              b.setStyle(styleMap[sanitized.style] || ButtonStyle.Secondary);
            }

            if (sanitized.disabled) b.setDisabled(true);

            return b;
          });

          if (btns.length > 0) {
            container.addActionRowComponents((row) => row.addComponents(...btns));
            actionRowCount++;
          }
          break;
        }

        case "image": {
          if (!item.url) {
            console.warn("⚠️ Image component missing URL");
            break;
          }

          const imageUrl = item.url;

          // Handle attachment URLs
          if (imageUrl.startsWith("attachment://")) {
            const filename = imageUrl.replace("attachment://", "");
            if (item.buffer) {
              attachments.push(
                new AttachmentBuilder(item.buffer, { name: filename })
              );
            }
          }

          container.addMediaGalleryComponents((g) =>
            g.addItems({ media: { url: imageUrl } })
          );
          break;
        }

        case "separator":
          container.addSeparatorComponents(
            new SeparatorBuilder().setDivider(item.divider !== false)
          );
          break;

        case "text":
          if (item.content) {
            const truncated = truncateText(item.content, LIMITS.TEXT_CONTENT);
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(truncated)
            );
          }
          break;

        case "select": {
          if (!item.customId) {
            console.warn("⚠️ Select menu missing customId, generating random one");
            item.customId = `select_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          }

          if (!item.options || !Array.isArray(item.options)) {
            console.warn("⚠️ Select menu missing options array");
            break;
          }

          // Limit options
          const options = item.options.slice(0, LIMITS.SELECT_OPTIONS);
          
          if (item.options.length > LIMITS.SELECT_OPTIONS) {
            console.warn(`⚠️ Too many select options (${item.options.length}), limiting to ${LIMITS.SELECT_OPTIONS}`);
          }

          const sanitizedOptions = options.map(sanitizeSelectOption);

          const menu = new StringSelectMenuBuilder()
            .setCustomId(item.customId)
            .setPlaceholder(
              truncateText(
                item.placeholder || "Select an option...",
                LIMITS.SELECT_PLACEHOLDER
              )
            )
            .addOptions(sanitizedOptions);

          if (item.minValues !== undefined) {
            menu.setMinValues(Math.max(0, Math.min(item.minValues, sanitizedOptions.length)));
          }
          
          if (item.maxValues !== undefined) {
            menu.setMaxValues(Math.max(1, Math.min(item.maxValues, sanitizedOptions.length)));
          }

          if (item.disabled) menu.setDisabled(true);

          container.addActionRowComponents((row) => row.addComponents(menu));
          actionRowCount++;
          break;
        }

        default:
          console.warn(`⚠️ Unknown component type: ${item.type}`);
      }
    } catch (error) {
      console.error(`❌ Error building component type "${item.type}":`, error.message);
      console.error("Component config:", item);
    }
  }

  // Warn if too many action rows
  if (actionRowCount > LIMITS.ACTION_ROWS) {
    console.warn(`⚠️ Too many action rows (${actionRowCount}), Discord limit is ${LIMITS.ACTION_ROWS}`);
  }

  return { container, attachments };
};

// Export utilities for external use
export { parseEmoji, truncateText, sanitizeButton, sanitizeSelectOption, LIMITS };