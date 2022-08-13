import { IUser } from "../db/User";

export interface IDashboardProps {
	pathname?: string;
	user?: IUser;
	token: string;
}

export interface IDashboardHomeProps extends IDashboardProps {
	notes: any;
}
