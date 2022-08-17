import { IGroup } from "./Group";

export type TRoles = "admin" | "editor" | "forum_moderator" | "shortlink_moderator" | "user";
export const validRoles: TRoles[] = ["admin", "editor", "forum_moderator", "shortlink_moderator", "user"];
export interface IUserForm {
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	group?: IGroup[];
	role: TRoles[];
}
export interface IUser extends IUserForm {
	_id: string;
	__v: number;
	createdAt: Date;
	updatedAt: Date;
}

export type validUserSort = "username" | "role" | "group" | "createdAt";
// email is alongside username
// fistname and last name appears when hovering username
export interface UserSort {
	username: (a: IUser, b: IUser) => number;
	role: (a: IUser, b: IUser) => number;
	group: (a: IUser, b: IUser) => number;
	createdAt: (a: IUser, b: IUser) => number;
}

export interface UserQRes {
	data: IUser[];
	message: string;
	page: number;
	pages: number;
	success: boolean;
}
