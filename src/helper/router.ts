import { NextRouter } from "next/router";

export const removeQueryParam = (router: NextRouter, param: string) => {
	const { pathname, query } = router;
	const params = new URLSearchParams(query as unknown as string);
	params.delete(param);
	router.replace({ pathname, query: params.toString() }, undefined, { shallow: true });
};

export const addQueryParam = (router: NextRouter, param: string, value: string) => {
	const { pathname } = router;
	const params = new URLSearchParams(router.query as unknown as string);
	params.set(param, value);
	router.replace({ pathname, query: params.toString() }, undefined, { shallow: true });
};
