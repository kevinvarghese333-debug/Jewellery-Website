// Public business contact destinations. Set these before production release.
const env = (
  import.meta as ImportMeta & { env: Record<string, string | undefined> }
).env;
const number = (env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");
export const whatsappNumber = /^[1-9]\d{9,14}$/.test(number) ? number : "";
function socialUrl(value: string | undefined, hosts: string[]) {
  try {
    const url = new URL(value || "");
    return url.protocol === "https:" && hosts.includes(url.hostname)
      ? url.href
      : "";
  } catch {
    return "";
  }
}
export const socialLinks = {
  facebook: socialUrl(env.VITE_FACEBOOK_URL, [
    "facebook.com",
    "www.facebook.com",
    "m.facebook.com",
  ]),
  instagram: socialUrl(env.VITE_INSTAGRAM_URL, [
    "instagram.com",
    "www.instagram.com",
  ]),
};
export function consultationUrl(subject = "a private jewellery consultation") {
  return whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello Kavitha Jewellery, I would like to enquire about ${subject}.`)}`
    : "";
}
export const storeAddress =
  "Kavitha Shopping Complex, Devaswom Nada, Cherai, Kerala";
export const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeAddress)}`;
export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
