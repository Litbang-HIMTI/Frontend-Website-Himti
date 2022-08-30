import { NextRouter } from "next/router";
import { addQueryParam, removeQueryParam } from "../global/router";

export const handleInputQueryChange = (e: React.ChangeEvent<HTMLInputElement>, setFunc: (value: string) => void, param: string, router: NextRouter) => {
	setFunc(e.target.value);
	if (e.target.value === "") removeQueryParam(router, param);
	else addQueryParam(router, param, e.target.value);
};
