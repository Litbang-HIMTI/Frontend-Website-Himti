import { IUser } from "./User";

export type TVisibility = "public" | "draft" | "private";
export interface IBlog {
	_id: string;
	__v: number;
	author: IUser[];
	title: string;
	visibility: string;
	description: string;
	content: string;
	thumbnail?: string;
	tags?: string[];
	pinned: boolean;
	showAtHome: boolean;
	editedBy?: IUser[];
	createdAt: Date;
	updatedAt: Date;
}

export interface IBlogRevision extends IBlog {
	revision?: number;
	blogId?: IBlog | string;
}

// description in hover title
export type validBlogSort = "title" | "visibility" | "tags" | "author" | "pinned" | "showAtHome" | "createdAt";
export interface BlogSort {
	title: (a: IBlog, b: IBlog) => number;
	visibility: (a: IBlog, b: IBlog) => number;
	tags: (a: IBlog, b: IBlog) => number;
	author: (a: IBlog, b: IBlog) => number;
	pinned: (a: IBlog, b: IBlog) => number;
	showAtHome: (a: IBlog, b: IBlog) => number;
	createdAt: (a: IBlog, b: IBlog) => number;
}

export interface BlogQRes {
	data: IBlog[];
	message: string;
	page: number;
	pages: number;
	success: boolean;
}
