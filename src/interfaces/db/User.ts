import { IGroup } from "./Group";

export type TRoles = "admin" | "editor" | "forum_moderator" | "shortlink_moderator" | "user";
export interface IUser {
	_id: number;
	__v: number;
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	group?: IGroup[];
	role: TRoles[];
	createdAt: Date;
	updatedAt: Date;
}

export type validUserSort = "username" | "role" | "group" | "createdAt";
// email is alongside username
// fistname and last name appears when hovering username

export interface UserQRes {
	data: IUser[];
	message: string;
	page: number;
	pages: number;
	success: boolean;
}
