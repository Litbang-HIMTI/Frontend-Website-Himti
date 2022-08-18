export interface IForumCategory {
	_id: string;
	__v: number;
	name: string;
	description: string;
	createdAt: Date;
	updatedAt: Date;
}

export type validForumCategorySort = "name" | "description" | "createdAt";
export interface ForumCategorySort {
	name: (a: IForumCategory, b: IForumCategory) => number;
	description: (a: IForumCategory, b: IForumCategory) => number;
	createdAt: (a: IForumCategory, b: IForumCategory) => number;
}

export interface ForumCategoryQRes {
	data: IForumCategory[];
	message: string;
	page: number;
	pages: number;
	success: boolean;
}
