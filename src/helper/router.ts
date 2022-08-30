import { TabsValue } from "@mantine/core/lib/Tabs/Tabs.types";
import { NextRouter } from "next/router";
import { SetStateAction } from "react";
import { IFillDataPage } from "./admin/fetchData";

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

export const handleTabChange = (index: TabsValue, setTabIndex: (val: number) => void, router: NextRouter) => {
	setTabIndex(index ? parseInt(index) : 0);
	addQueryParam(router, "tab", index ? index : "0");
};

export const handlePageChange = (
	page: number,
	perPage: number,
	fillDataPage: IFillDataPage,
	router: NextRouter,
	api_url: string,
	setLoadingDataPage: (value: SetStateAction<boolean>) => void,
	setCurPage: (val: SetStateAction<number>) => void,
	setPages: (value: SetStateAction<number>) => void,
	setDataPage: (value: SetStateAction<any[]>) => void
) => {
	setCurPage(page);
	addQueryParam(router, "page", page.toString());
	fillDataPage(api_url, perPage, page, setLoadingDataPage, setCurPage, setPages, setDataPage);
};
