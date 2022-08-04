/**
 * Prod or dev mode
 */ export const ___prod___ = process.env.NODE_ENV === "production";

/**
 * server
 */
export const server = ___prod___ ? "https://api.himtiuinjkt.or.id/" : "http://localhost:42069";
