import { IUser, TRoles } from "../../interfaces/db/User";

// validate role
const validStaff: TRoles[] = ["admin", "editor", "forum_moderator", "shortlink_moderator"];
export const validateAdmin = (user: IUser) => {
	return user && user.role?.includes("admin");
};

export const validateStaff = (user: IUser) => {
	return user && validStaff.some((subString) => user.role?.includes(subString));
};

export const validateEditor = (user: IUser) => {
	return user && (user.role?.includes("admin") || user.role?.includes("editor"));
};

export const validateForumMod = (user: IUser) => {
	return user && (user.role?.includes("admin") || user.role?.includes("forum_moderator"));
};

export const validateShortlinkMod = (user: IUser) => {
	return user && (user.role?.includes("admin") || user.role?.includes("shortlink_moderator"));
};
