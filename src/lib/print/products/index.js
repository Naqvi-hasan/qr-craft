// Printable products. To add one: create a file in this folder (copy review.js) and list it here.
import business from "./business.js";
import wifi from "./wifi.js";
import upi from "./upi.js";
import review from "./review.js";
import wristband from "./wristband.js";
import invitation from "./invitation.js";
import badge from "./badge.js";
import sticker from "./sticker.js";
import poster from "./poster.js";

export const PRODUCTS = [business, wifi, upi, review, wristband, invitation, badge, sticker, poster];
export const PRODUCT_MAP = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
export const getProduct = (id) => PRODUCT_MAP[id] ?? PRODUCTS[0];
