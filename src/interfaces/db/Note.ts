import { IUser } from "./User";

export interface INote {
	_id: string;
	__v: number;
	author: IUser[];
	title: string;
	content: string;
	editedBy?: IUser[];
	createdAt: Date;
	updatedAt: Date;
	position: number;
}

export type validNoteSort = "title" | "content" | "author" | "createdAt";
export interface NoteSort {
	title: (a: INote, b: INote) => number;
	content: (a: INote, b: INote) => number;
	author: (a: INote, b: INote) => number;
	createdAt: (a: INote, b: INote) => number;
}

export interface NoteQRes {
	data: INote[];
	message: string;
	page: number;
	pages: number;
	success: boolean;
}
