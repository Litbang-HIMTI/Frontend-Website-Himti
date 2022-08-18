import { IUser } from "./User";

export interface IShortlink {
	_id: string;
	__v: number;
	author: IUser[];
	shorten: string;
	url: string;
	clickCount: number;
	createdAt: Date;
	updatedAt: Date;
	editedBy?: IUser[];
}

export type validShortlinkSort = "shorten" | "url" | "clickCount" | "author" | "createdAt";
export interface ShortlinkSort {
	shorten: (a: IShortlink, b: IShortlink) => number;
	url: (a: IShortlink, b: IShortlink) => number;
	clickCount: (a: IShortlink, b: IShortlink) => number;
	author: (a: IShortlink, b: IShortlink) => number;
	createdAt: (a: IShortlink, b: IShortlink) => number;
}

export interface ShortlinkQRes {
	data: IShortlink[];
	message: string;
	page: number;
	pages: number;
	success: boolean;
}
