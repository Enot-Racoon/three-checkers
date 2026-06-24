import type { VercelRequest, VercelResponse } from "@vercel/node";

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

const playButtonText = process.env.TELEGRAM_PLAY_BUTTON_TEXT || "Play";

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
              text: playButtonText,
              web_app: { url: WEB_APP_URL },
            },
          ],
        ],
      },
    }),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const update = req.body as Update | undefined;
  const message = update?.message;

  if (!message) {
    return res.status(200).send("ok");
  }

  const chatId = message.chat.id;
  const text = message.text ?? "";

  if (text === "/start") {
    await sendMessage(chatId, startMessage);
  } else {
    await sendMessage(chatId, otherMessage);
  }

  return res.status(200).send("ok");
}
