import { TabsValue } from "@mantine/core/lib/Tabs/Tabs.types";
import { NextRouter } from "next/router";
import { SetStateAction } from "react";
import { addQueryParam } from "../global/router";

export const handleAdminTabChange = (index: TabsValue, setTabIndex: (val: number) => void, router: NextRouter) => {
	setTabIndex(index ? parseInt(index) : 0);
	addQueryParam(router, "tab", index ? index : "0");
};

export const handleAdminPageChange = (
	page: number,
	perPage: number,
	fillDataPage: any,
	router: NextRouter,
	api_url: string,
	setLoadingDataPage: (value: SetStateAction<boolean>) => void,
	setCurPage: (val: SetStateAction<number>) => void,
	setPages: (value: SetStateAction<number>) => void,
	setDataPage: (value: SetStateAction<any[]>) => void
) => {
	setCurPage(page);
	addQueryParam(router, "page", page.toString());
	fillDataPage({ api_url, perPage, curPageQ: page, setLoadingDataPage, setCurPage, setPages, setDataPage });
};
