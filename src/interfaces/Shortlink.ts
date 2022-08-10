export interface IShortlink {
	_id: number;
	__v: number;
	shorten: string;
	url: string;
	clickCount: number;
	createdAt: Date;
	updatedAt: Date;
}
