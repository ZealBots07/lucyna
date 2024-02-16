import fs from 'fs/promises';
import bot from "./bot";
import { run } from "@grammyjs/runner";
import { apiThrottler } from "@grammyjs/transformer-throttler";
import { logger } from "./logger"
import { channel_log } from "./logger";

// Initialize grammY runner
const runner = run(bot, { 
    runner: { 
        fetch: { 
            allowed_updates: ["message", "edited_message", "callback_query", "chat_member"] 
        } 
    } 
});

// Flood control plugin
const throttler = apiThrottler();
bot.api.config.use(throttler);

var ALL_MODULES: string[] = [];

(async function () {
    const modules = await fs.readdir("./dist/modules");
    for (const file of modules) {
        if (file.match(/.*\.(js)$/)) {
            await import(`./modules/${file}`);
            ALL_MODULES.push(`${file.replace(/\.[^\/.]+$/, "").toUpperCase()}`);
        }
    }
    await bot.api.deleteWebhook({ drop_pending_updates: true });    
})();

bot.init().then(async() => {
    var bot_info = (
        `${bot.botInfo.first_name}\n` + 
        `\#LAUNCHED on ${new Date().toLocaleString()}\n\n` +
        `• Username: @${bot.botInfo.username}\n` +
        `• Bot ID: ${bot.botInfo.id}\n` +
        `• Allow Groups: ${bot.botInfo.can_join_groups ? `Enabled` : `Disabled`}\n` +
        `• Privacy Mode: ${bot.botInfo.can_read_all_group_messages ? `Disabled` : `Enabled`}\n` +
        `• Inline Mode: ${bot.botInfo.supports_inline_queries ? `Enabled` : `Disabled`}\n`
    );
    
    console.log(bot_info + `\nLoaded modules: [ ${ALL_MODULES.join(", ")} ]\n`);
    channel_log(bot_info + `\nLoaded modules: [ <code>${ALL_MODULES.join(", ")}</code> ]`);
});

async function exitSignal(signal: String) {
    runner.isRunning() && runner.stop();
    logger.info(`${signal} - Exiting...`);
}

process.once('SIGINT', () => {
    exitSignal('SIGINT');
});
process.once('SIGTERM', () => {
    exitSignal('SIGTERM');
});