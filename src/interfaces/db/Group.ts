export interface IGroup {
	_id: string;
	__v: number;
	name: string;
	description: string;
	count: number;
	createdAt: Date;
	updatedAt: Date;
}

export type validGroupSort = "name" | "description" | "count" | "createdAt";
export interface GroupSort {
	name: (a: IGroup, b: IGroup) => number;
	description: (a: IGroup, b: IGroup) => number;
	count: (a: IGroup, b: IGroup) => number;
	createdAt: (a: IGroup, b: IGroup) => number;
}

export interface GroupQRes {
	data: IGroup[];
	message: string;
	page: number;
	pages: number;
	success: boolean;
}
