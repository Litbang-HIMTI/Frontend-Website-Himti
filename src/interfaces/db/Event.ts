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

export interface EventTags {
	_id: string;
	count: number;
}

export type validEventSort = "author" | "title" | "visibility" | "tags" | "pinned" | "showAtHome" | "createdAt";
export interface EventSort {
	author: (a: IEvent, b: IEvent) => number;
	title: (a: IEvent, b: IEvent) => number;
	visibility: (a: IEvent, b: IEvent) => number;
	tags: (a: IEvent, b: IEvent) => number;
	pinned: (a: IEvent, b: IEvent) => number;
	showAtHome: (a: IEvent, b: IEvent) => number;
	createdAt: (a: IEvent, b: IEvent) => number;
}

export interface EventQRes {
	data: IEvent[];
	message: string;
	page: number;
	pages: number;
	success: boolean;
}
