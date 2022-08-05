export interface I_Shortlink {
	_id: number;
	shorten: string;
	url: string;
	createdAt: Date;
	updatedAt: Date;
	__v: number;
	clickCount: number;
}
