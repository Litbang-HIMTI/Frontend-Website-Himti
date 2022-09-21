import { IBlog } from "./Blog";
import { IEvent } from "./Event";
import { IForum } from "./Forum";
import { IUser } from "./User";

export interface IComment {
	_id: string;
	__v: number;
	author?: IUser[];
	content: string;
	forumId: IForum[];
	blogId: IBlog[];
	eventId: IEvent[];
	createdAt: Date;
	updatedAt: Date;
}

export type validCommentSort = "author" | "content" | "createdAt";
export interface CommentSort {
	author: (a: IComment, b: IComment) => number;
	content: (a: IComment, b: IComment) => number;
	createdAt: (a: IComment, b: IComment) => number;
}

export interface CommentQRes {
	data: IComment[];
	message: string;
	page: number;
	pages: number;
	success: boolean;
}
