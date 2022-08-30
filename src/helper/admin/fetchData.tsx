import { showNotification, updateNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons";
import { SetStateAction } from "react";
import { SERVER_V1 } from "../global/constants";

export type IDeleteData = (_id: string, api_url: string, setDataPage: (value: SetStateAction<any[]>) => void, setDataAllPage: (value: SetStateAction<any[]>) => void) => Promise<void>;
export type IFillDataAll = (
	api_url: string,
	setLoadingDataAll: (value: SetStateAction<boolean>) => void,
	setDataAllPage: (value: SetStateAction<any[]>) => void,
	extraCallback?: (data: any) => void
) => Promise<void>;
export type IFillDataPage = (
	api_url: string,
	perPage: number,
	curPageQ: number,
	setLoadingDataPage: (value: SetStateAction<boolean>) => void,
	setCurPage: (value: SetStateAction<number>) => void,
	setPages: (value: SetStateAction<number>) => void,
	setDataPage: (value: SetStateAction<any[]>) => void,
	extraCallback?: (data: any) => void
) => Promise<void>;

export const deleteData: IDeleteData = async (_id, api_url, setDataPage, setDataAllPage) => {
	showNotification({ id: "delete-notif", title: "Loading", message: "Deleting...", loading: true, disallowClose: true });
	try {
		const req = await fetch(`${SERVER_V1}/${api_url}/${_id}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		const { success, message }: { success: boolean; message: string } = await req.json();
		if (req.status === 200 && success) {
			// slice data
			setDataPage((prev) => prev.filter((item) => item._id !== _id));
			setDataAllPage((prev) => prev.filter((item) => item._id !== _id));
			updateNotification({ id: "delete-notif", title: "Success", message, loading: false, disallowClose: false, icon: <IconCheck size={16} />, autoClose: 2500 });
		} else {
			updateNotification({ id: "delete-notif", title: "Error", message, color: "red", loading: false, disallowClose: false, icon: <IconX size={16} /> });
		}
	} catch (error: any) {
		updateNotification({ id: "delete-notif", title: "Error", message: error.message, color: "red", loading: false, disallowClose: false, icon: <IconX size={16} /> });
	}
};

export const fillDataAll: IFillDataAll = async (api_url, setLoadingDataAll, setDataAllPage, extraCallback) => {
	try {
		setLoadingDataAll(true);
		const req = await fetch(SERVER_V1 + `/${api_url}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		const { data, success, message }: { data: any; success: boolean; message: string } = await req.json();
		if (req.status === 200 && success) {
			setDataAllPage(data);
			if (extraCallback) extraCallback(data); // call extra callback if exists
			setLoadingDataAll(false);
		} else {
			setLoadingDataAll(false);
			return showNotification({ title: "Error indexing all data for search", message, color: "red", icon: <IconX size={16} /> });
		}
	} catch (error: any) {
		setLoadingDataAll(false);
		showNotification({ title: "Error indexing all data for search", message: error.message, color: "red", icon: <IconX size={16} /> });
	}
};

export const fillDataPage: IFillDataPage = async (api_url, perPage, curPageQ, setLoadingDataPage, setCurPage, setPages, setDataPage, extraCallback) => {
	try {
		setLoadingDataPage(true);
		const req = await fetch(SERVER_V1 + `/${api_url}?perPage=${perPage}&page=${curPageQ}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		const { data, success, message, page, pages }: { data: any; success: boolean; message: string; page: number; pages: number } = await req.json();
		if (req.status === 200 && success) {
			setCurPage(page);
			setPages(pages ? pages : 1);
			setDataPage(data);
			if (extraCallback) extraCallback(data); // call extra callback if exists
			setLoadingDataPage(false);
		} else {
			setLoadingDataPage(false);
			return showNotification({ title: "Error getting page data", message, color: "red", icon: <IconX size={16} /> });
		}
	} catch (error: any) {
		setLoadingDataPage(false);
		showNotification({ title: "Error getting page data", message: error.message, color: "red", icon: <IconX size={16} /> });
	}
};
