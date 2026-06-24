import type { Config } from "@netlify/functions";

const startMessage =
  process.env.TELEGRAM_START_MESSAGE ||
  `
👋 Welcome!

This bot launches the Chess Mini App.

Press the button below to start playing.
`.trim();

const otherMessage =
  process.env.TELEGRAM_OTHER_MESSAGE ||
  `
This bot does not support chat messages.

Press the button below to open the Chess Mini App.
`.trim();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = process.env.TELEGRAM_WEB_APP_URL;

type Update = {
  update_id: number;
  message: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username: string;
    };
    chat: {
      id: number;
      type: string;
      first_name: string;
      username: string;
    };
    text: string;
  };
};

async function sendMessage(chatId: number, text: string) {
  if (!BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN missing");
  if (!WEB_APP_URL) throw new Error("TELEGRAM_WEB_APP_URL missing");

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "▶ Open Chess Board",
              web_app: { url: WEB_APP_URL },
            },
          ],
        ],
      },
    }),
  });
}

export default async function handler(request: Request) {
  const update = (await request.json()) as Update;
  const message = update.message;

  if (!message) {
    return new Response("ok");
  }

  const chatId = message.chat.id;
  const text = message.text ?? "";

  if (text === "/start") {
    await sendMessage(chatId, startMessage);
  } else {
    await sendMessage(chatId, otherMessage);
  }

  return new Response("ok");
}

export const config: Config = {
  path: "/telegram-webhook",
};
