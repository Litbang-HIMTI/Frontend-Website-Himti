import { NextRouter } from "next/router";
import { addQueryParam, removeQueryParam } from "../global/router";

export const handleInputQueryChange = (e: React.ChangeEvent<HTMLInputElement>, setFunc: (value: string) => void, param: string, router: NextRouter) => {
	setFunc(e.target.value);
	if (e.target.value === "") removeQueryParam(router, param);
	else addQueryParam(router, param, e.target.value);
};

export const handleSelectQueryChange = (value: string, setFunc: (value: any) => void, param: string, router: NextRouter, realValue?: any) => {
	setFunc(realValue ? realValue : value);
	if (value === "") removeQueryParam(router, param);
	else addQueryParam(router, param, value);
};

export const handleNumInputChange = (value: number | undefined, setFunc: (value: string) => void, param: string, router: NextRouter) => {
	if (!value) {
		setFunc("");
		removeQueryParam(router, param);
	} else {
		setFunc(value.toString());
		addQueryParam(router, param, value.toString());
	}
};
