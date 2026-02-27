const { Client, GatewayIntentBits, ActivityType, EmbedBuilder } = require('discord.js');
const express = require('express');
require('dotenv').config();

const app = express();
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ] 
});

// سيرفر ويب بسيط لإبقاء البوت حياً على Render
app.get('/', (req, res) => {
  res.send('Bot is Online! ✅');
});

app.listen(3000, () => {
  console.log('🌐 Web Server is running on port 3000');
});

const SUGGESTIONS_CHANNEL_ID = '1474977424641888318';

client.once('ready', () => {
  console.log(`✅ البوت متصل! ${client.user.tag}`);
  
  // ✅ التعديل الوحيد هنا
  client.user.setPresence({
    activities: [{ name: '🟢', type: ActivityType.Playing }],
    status: 'online'
  });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channelId !== SUGGESTIONS_CHANNEL_ID) return;

  try {
    const embed = new EmbedBuilder()
      .setColor('#2f3136')
      .setTitle('💡 اقتراح جديد')
      .setAuthor({ 
        name: message.author.username, 
        iconURL: message.author.displayAvatarURL() 
      })
      .setFooter({ 
        text: `ID: ${message.author.id} | Bot by: raye0006`
      })
      .setTimestamp();

    if (message.content && message.content.trim() !== '') {
      embed.setDescription(message.content);
    }

    if (message.attachments.size > 0) {
      const attachment = message.attachments.first();
      if (attachment.contentType?.startsWith('image')) {
        embed.setImage(attachment.url);
      }
    }

    const embedMessage = await message.channel.send({ embeds: [embed] });
    await embedMessage.react('✅');
    await embedMessage.react('❌');

    await embedMessage.startThread({
      name: `مناقشة اقتراح ${message.author.username}`,
      autoArchiveDuration: 1440,
      reason: 'مناقشة اقتراح جديد'
    });

    setTimeout(() => {
      message.delete().catch(() => {});
    }, 1000);

  } catch (error) {
    console.error('❌ خطأ:', error);
  }
});

client.login(process.env.DISCORD_TOKEN);
