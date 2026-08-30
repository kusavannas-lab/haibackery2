import { Order, PhotoCakeRequest } from "./types";
import { formatCurrency } from "./utils";

export const ADMIN_PHONE = "919347166241";
export const ADMIN_NAME = "Shekhar Rao";
export const STORE_NAME = "Hai Backery";
export const STORE_ADDRESS = "Barrage Center, Bommika, Hiramandalam, Srikakulam – 532459, Andhra Pradesh";

/**
 * Generate WhatsApp Click-to-Chat URL for a standard bakery order
 */
export function generateOrderWhatsAppUrl(order: Order): string {
  const itemsText = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.product_title || 'Item'}* x ${item.quantity} = ${formatCurrency(
          item.unit_price * item.quantity
        )}`
    )
    .join("\n");

  const message = `🎂 *NEW STORE PICKUP ORDER - ${STORE_NAME}* 🎂\n` +
    `----------------------------------------\n` +
    `📋 *Order ID:* ${order.id}\n` +
    `👤 *Customer Name:* ${order.customer_name}\n` +
    `📞 *Customer Mobile:* ${order.customer_phone}\n` +
    `📍 *Pickup Location:* Hai Backery, Barrage Center, Bommika\n` +
    `💳 *Payment:* Pay at Counter (Cash / UPI on Pickup)\n` +
    (order.notes ? `📝 *Pickup Time / Notes:* ${order.notes}\n` : "") +
    `----------------------------------------\n` +
    `🛒 *ITEMS TO PACK:*\n${itemsText}\n` +
    `----------------------------------------\n` +
    `💰 *TOTAL AMOUNT TO PAY: ${formatCurrency(order.total_amount)}*\n` +
    `📅 *Order Time:* ${new Date(order.created_at).toLocaleString("en-IN")}\n` +
    `----------------------------------------\n` +
    `⚡ _Please keep this order freshly packed and ready for customer pickup at the Hai Backery counter!_`;

  return `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate WhatsApp Click-to-Chat URL for a Custom Photo Cake Request
 */
export function generatePhotoCakeWhatsAppUrl(request: PhotoCakeRequest): string {
  const message = `📸🎂 *NEW CUSTOM PHOTO CAKE PICKUP - ${STORE_NAME}* 🎂📸\n` +
    `----------------------------------------\n` +
    `📋 *Request ID:* ${request.id}\n` +
    `👤 *Customer Name:* ${request.customer_name}\n` +
    `📞 *Customer Mobile:* ${request.customer_phone}\n` +
    `🍰 *Flavor:* ${request.cake_flavor}\n` +
    (request.cake_shape ? `⏹️ *Cake Shape:* ${request.cake_shape}\n` : "") +
    `⚖️ *Weight:* ${request.cake_weight}\n` +
    `📄 *Sugar Sheet Print Area:* Max 8.27 × 11.69 in (A4 / Scaled to Cake Size)\n` +
    `🌱 *Type:* ${request.eggless ? '100% Eggless 🟢' : 'Regular'}\n` +
    (request.message ? `✍️ *Text on Cake:* "${request.message}"\n` : "") +
    `📅 *Pickup Date:* ${request.delivery_date}\n` +
    `⏰ *Pickup Time Slot:* ${request.delivery_time}\n` +
    `📍 *Pickup Location:* Hai Backery Counter, Barrage Center, Bommika\n` +
    `💳 *Payment:* Pay at Shop Counter on Pickup (Cash / UPI)\n` +
    (request.estimated_price ? `💵 *Estimated Price:* ${formatCurrency(request.estimated_price)}\n` : "") +
    (request.notes ? `📝 *Special Instructions:* ${request.notes}\n` : "") +
    `----------------------------------------\n` +
    `🖼️ *UPLOADED PHOTO URL:*\n${request.image_url}\n` +
    `----------------------------------------\n` +
    `⚡ _Hai Backery Barrage Center Bommika - Please verify image resolution & baking schedule!_`;

  return `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate direct inquiry / customer care link
 */
export function generateDirectInquiryWhatsAppUrl(customText?: string): string {
  const defaultText = `Hello Shekhar Rao / Hai Backery team, I have an inquiry regarding fresh sweets, cakes & bakery items from your Bommika shop.`;
  const text = customText || defaultText;
  return `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate customer direct chat link for Admin to reach the customer
 */
export function generateAdminToCustomerWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.startsWith("91") && cleanPhone.length > 10 ? cleanPhone : `91${cleanPhone}`;
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}
