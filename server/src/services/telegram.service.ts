import TelegramBot from "node-telegram-bot-api";
import { ENV } from "../config/env";
import { ExtractedIntakeData } from "./gemini.service";

let bot: TelegramBot | null = null;

if (ENV.TELEGRAM_BOT_TOKEN) {
  try {
    bot = new TelegramBot(ENV.TELEGRAM_BOT_TOKEN, { polling: false });
    // Prevent unhandled error event crashes
    bot.on("error", (error) => {
      console.error("[Telegram Bot Error Event]:", error);
    });
    bot.on("polling_error", (error) => {
      console.error("[Telegram Bot Polling Error Event]:", error);
    });
  } catch (error) {
    console.error("[Telegram Bot Init Error]:", error);
  }
}

export async function sendTelegramNotification(
  intake: ExtractedIntakeData & { id?: string; rawInquiry?: string }
): Promise<boolean> {
  const botToken = ENV.TELEGRAM_BOT_TOKEN;
  const chatId = ENV.TELEGRAM_CHAT_ID;

  const urgencyEmoji = intake.urgency === "HIGH" ? "🚨" : intake.urgency === "MEDIUM" ? "⚠️" : "ℹ️";

  const message = `${urgencyEmoji} *NEW LEGAL INQUIRY QUALIFIED*
───────────────
👤 *Client Name:* ${intake.clientName}
⚖️ *Practice Area:* ${intake.practiceArea}
🔥 *Urgency Level:* ${intake.urgency} (Score: ${intake.urgencyScore}/100)
🛡️ *Conflict Check:* ${intake.conflictStatus === "CLEARED" ? "✅ CLEARED" : "⚠️ POTENTIAL MATCH"}
👨‍⚖️ *Assigned Attorney:* ${intake.assignedAttorney}
💰 *Est. Retainer Value:* ${intake.estValue}

📝 *Case Summary:*
_${intake.summary}_

───────────────
📌 _Routed automatically by Route AI Agent v4_`;

  console.log("\n--- [TELEGRAM BOT DISPATCH LOG] ---");
  console.log(message);
  console.log("-----------------------------------\n");

  if (botToken && chatId) {
    try {
      if (bot) {
        await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
      } else {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "Markdown",
          }),
        });
      }
      return true;
    } catch (error) {
      console.error("[Telegram Dispatch Failed]:", error);
      return false;
    }
  } else {
    console.log("[Telegram Service] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured in .env. Notification logged to console.");
    return false;
  }
}
