/* eslint-disable */
/**
 * Email regex
 */
export const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

/**
 * Alpha numeric, underscore, and hyphen regex
 */
export const urlSaferRegex = /^[a-zA-Z0-9_-]+$/;

/**
 *  Alpha numeric, underscore, hyphen, space, ', ", comma, and @ regex
 */
export const urlSafeRegex = /^[a-zA-Z0-9_-\s'",@]+$/;

/**
 * URL regex
 */
export const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

/**
 * Image URL regex
 */
export const imageUrlRegex = /(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg|webp))/;

/**
 * validate password
 */

export const validatePassword = (password: string) => {
	if (!password) return { message: "Password is required", success: false };
	if (password.length < 8) return { message: "Password must be at least 8 characters long", success: false };
	if (password.length > 250) return { message: "Password must be at most 250 characters long", success: false };
	if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/.test(password))
		return {
			message: "Password must must contain at least one special character (@$!%*?&._-)",
			success: false,
		};

	return { message: "Password is valid", success: true };
};
