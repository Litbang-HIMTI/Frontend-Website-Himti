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
	salt: string;
	hash: string;
	createdAt: Date;
	updatedAt: Date;
}
