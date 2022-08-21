export interface IdCount {
	_id: string;
	count: number;
}

export type ValidIdCountSort = "name" | "count";
export interface IdCountSort {
	name: (a: IdCount, b: IdCount) => number;
	count: (a: IdCount, b: IdCount) => number;
}

export interface IDCountQRes {
	data: IdCount[];
	message: string;
	success: boolean;
}
