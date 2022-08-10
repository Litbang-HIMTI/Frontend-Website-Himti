import { IUser } from "../interfaces/User";

// validate role
export const validateAdmin = (user: IUser) => {
	return user && user.role?.includes("admin");
};

export const validateStaff = (user: IUser) => {
	return user && (user.role?.includes("admin") || user.role?.includes("editor") || user.role?.includes("forum_moderator") || user.role?.includes("shortlink_moderator"));
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
