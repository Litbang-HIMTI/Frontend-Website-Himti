/**
 * Prod or dev mode
 */ export const ___prod___ = process.env.NODE_ENV === "production";

/**
 * server
 */
export const ___server___ = ___prod___ ? "https://api.himtiuinjkt.or.id" : "http://localhost:42069";
export const ___serverV1___ = ___server___ + "/v1";
