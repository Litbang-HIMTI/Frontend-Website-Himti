import { IUser } from "./User";

export interface INote {
	_id: string;
	__v: number;
	author: IUser;
	title: string;
	content: string;
	editedBy?: IUser;
	createdAt: Date;
	updatedAt: Date;
	position: number;
}
