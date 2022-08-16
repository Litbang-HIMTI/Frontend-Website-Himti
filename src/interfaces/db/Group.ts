export interface IGroup {
	_id: string;
	__v: number;
	name: string;
	description: string;
	createdAt: Date;
	updatedAt: Date;
	count: number;
}

export type validGroupSort = "name" | "description" | "count" | "createdAt";
export interface GroupSort {
	name: (a: IGroup, b: IGroup) => number;
	description: (a: IGroup, b: IGroup) => number;
	count: (a: IGroup, b: IGroup) => number;
	createdAt: (a: IGroup, b: IGroup) => number;
}
