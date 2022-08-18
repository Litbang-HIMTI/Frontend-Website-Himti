import { IForumCategory } from "./Forum_Category";
import { IUser } from "./User";

export interface IForum {
	_id: string;
	__v: number;
	author: IUser[];
	title: string;
	content: string;
	category: IForumCategory[];
	locked?: boolean;
	pinned?: boolean;
	showAtHome?: boolean;
	editedBy?: IUser[];
	createdAt: Date;
	updatedAt: Date;
}

export type validForumSort = "title" | "description" | "locked" | "pinned" | "author" | "createdAt";
export interface ForumSort {
	title: (a: IForum, b: IForum) => number;
	description: (a: IForum, b: IForum) => number;
	locked: (a: IForum, b: IForum) => number;
	pinned: (a: IForum, b: IForum) => number;
	author: (a: IForum, b: IForum) => number;
	createdAt: (a: IForum, b: IForum) => number;
}

export interface ForumQRes {
	data: IForum[];
	message: string;
	page: number;
	pages: number;
	success: boolean;
}
