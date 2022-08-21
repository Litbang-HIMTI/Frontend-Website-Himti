import { IUser } from "./User";

export interface IEvent {
	_id: string;
	__v: number;
	author: IUser[];
	title: string;
	visibility: string;
	description: string;
	content: string;
	price: number;
	startDate: Date;
	endDate: Date;
	thumbnail?: string;
	tags?: string[];
	location?: string;
	link?: string;
	organizer?: string;
	email?: string;
	pinned?: boolean;
	showAtHome?: boolean;
	editedBy?: IUser[];
	createdAt: Date;
	updatedAt: Date;
}

export interface IEventRevision extends IEvent {
	revision: number;
	eventId: IEvent | string;
}
// description in hover title
export type validEventSort = "title" | "visibility" | "tags" | "pinned" | "showAtHome" | "author" | "createdAt";
export interface EventSort {
	title: (a: IEvent, b: IEvent) => number;
	visibility: (a: IEvent, b: IEvent) => number;
	tags: (a: IEvent, b: IEvent) => number;
	pinned: (a: IEvent, b: IEvent) => number;
	showAtHome: (a: IEvent, b: IEvent) => number;
	author: (a: IEvent, b: IEvent) => number;
	createdAt: (a: IEvent, b: IEvent) => number;
}

export interface EventQRes {
	data: IEvent[];
	message: string;
	page: number;
	pages: number;
	success: boolean;
}
