/**
 * Prod or dev mode
 */ export const ___prod___ = process.env.NODE_ENV === "production";

/**
 * server
 */
export const SERVER = ___prod___ ? "https://api.himtiuinjkt.or.id" : "http://localhost:42069";
export const SERVER_V1 = SERVER + "/v1";
export const SERVER_LOCAL = ___prod___ ? "https://himtiuinjkt.or.id/api" : "http://localhost:3000/api";
export const SERVER_LOCAL_V1 = SERVER_LOCAL + "/v1";
