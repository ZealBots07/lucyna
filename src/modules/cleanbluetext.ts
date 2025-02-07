import { Composer, NextFunction } from "grammy";
import { elevatedUsersOnly } from "../helpers/helper_func";
import { get_clean_bluetext, set_clean_bluetext } from "../database/clean_bluetext_chat_setting_sql";

const composer = new Composer();

async function cleanBluetextSwitch(ctx: any, chatId: string, cleanBluetext: boolean) {
    let clean_service_switch = await set_clean_bluetext(chatId.toString(), cleanBluetext);
    
    if (clean_service_switch) {
        await ctx.reply(`Cleaning of bluetext containing messages has been turned <b>${cleanBluetext ? "ON" : "OFF"}</b>.`, {reply_parameters: {message_id: ctx.message.message_id}, parse_mode: "HTML"})
    }
    else {
        await ctx.reply("An error occurred while trying to change the clean bluetext status.", {reply_parameters: {message_id: ctx.message.message_id}})
    }
}

function containsBotCommand(text: string): boolean {
    return /^\/[a-z0-9_]+(@\w+)?(\s|$)/i.test(text);
}

composer.chatType(["supergroup", "group"]).command(["cleanbluetext", "cleanblue"], elevatedUsersOnly(async(ctx: any) => {
    let args = ctx.match.toLowerCase();

    if (args) {;
        if (args == "on" || args == "yes") {
            await cleanBluetextSwitch(ctx, ctx.chat.id, true);
        }
        else if (args == "off" || args == "no") {
            await cleanBluetextSwitch(ctx, ctx.chat.id, false);
        }
        else {
            await ctx.api.sendMessage(ctx.chat.id, "Invalid argument. Please use /cleanblue <code>on</code> or /cleanblue <code>off</code> to <b>enable</b> or <b>disable</b> deleting the bluetext (messages containing bot commands) respectively.", {reply_parameters: {message_id: ctx.message.message_id}, parse_mode: "HTML"});
        }
    }
    else {
        let clean_blue = await get_clean_bluetext(ctx.chat.id.toString());
        await ctx.reply(`Auto-deletion of bluetext messages is turned <b>${clean_blue?.is_enable ? "ON" : "OFF"}</b> as of now.`, {reply_parameters: {message_id: ctx.message.message_id}, parse_mode: "HTML"})

    }

}));

// composer.on(["message:text", "message:caption"], async(ctx: any, next) => {
//     let chat_id = ctx.chat?.id.toString();
//     if (!chat_id) return;

//     let text = ctx.message?.text || ctx.message?.caption;
//     if (!text) return;

//     if (containsBotCommand(text)) {
//         let cleanBluetext = await get_clean_bluetext(chat_id);
//         if (cleanBluetext) {
//             await ctx.deleteMessage().catch(() => {});
//         }
//     }

//     await next()
// });

export default composer;