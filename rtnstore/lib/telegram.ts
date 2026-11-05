export const TELEGRAM_USERNAME = "rtnstores";

import { money } from "./format";
export { money };

export function buildTelegramMessage(o: {
  paymentId: string;
  email: string;
  items: { name: string; qty: number; priceCents: number }[];
  totalCents: number;
  kind?: "order" | "redeem";
}) {
  const lines = [
    o.kind === "redeem" ? "🎁 RTNStore — Code Redemption" : "🛒 RTNStore — New Payment",
    `Payment ID: ${o.paymentId}`,
    `Customer: ${o.email || "-"}`,
    "",
    ...o.items.map((i) => `• ${i.name} × ${i.qty} — ${money(i.priceCents * i.qty)}`),
    "",
    `Total: ${money(o.totalCents)}`,
    o.kind === "redeem" ? "Please deliver my redeemed cape." : "I'd like to complete payment for this order.",
  ];
  return lines.join("\n");
}

export function telegramLink(message: string) {
  return `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
}

/** Optional: also push the order to a Telegram chat via a bot, when configured. */
export async function notifyBot(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
  } catch {
    /* non-fatal */
  }
}
