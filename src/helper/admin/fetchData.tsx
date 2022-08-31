import { TextInput, Button, Text, Code } from "@mantine/core";
import { closeAllModals, openConfirmModal, openModal } from "@mantine/modals";
import { showNotification, updateNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons";
import { SetStateAction } from "react";
import { SERVER_V1 } from "../global/constants";
import { randomBytes } from "crypto";

export type IDeleteData = (
	_id: string,
	api_url: string,
	setDataPage?: (value: SetStateAction<any[]>) => void,
	setDataAllPage?: (value: SetStateAction<any[]>) => void,
	extraCallback?: (data?: any) => void
) => Promise<void>;

interface IPromptParam {
	isGeneric?: boolean;
	genericMsg?: string;
	genericTitle?: string;
	customCallback?: (data?: any) => void;
	customCallbackParams?: any;
	_id?: string;
	api_url?: string;
	context?: string;
	extraCallback?: (data?: any) => void;
	setDataAllPage?: (value: SetStateAction<any[]>) => void;
	setDataPage?: (value: SetStateAction<any[]>) => void;
}
export type IActionPrompt = (extraParam: IPromptParam) => Promise<void>;

export type IFillDataAll = (
	api_url: string,
	setLoadingDataAll: (value: SetStateAction<boolean>) => void,
	setDataAllPage: (value: SetStateAction<any[]>) => void,
	extraCallback?: (data?: any) => void
) => Promise<void>;

export type IFillDataPage = (
	api_url: string,
	perPage: number,
	curPageQ: number,
	setLoadingDataPage: (value: SetStateAction<boolean>) => void,
	setCurPage: (value: SetStateAction<number>) => void,
	setPages: (value: SetStateAction<number>) => void,
	setDataPage: (value: SetStateAction<any[]>) => void,
	extraCallback?: (data?: any) => void
) => Promise<void>;
/**
 * @async
 * Modal prompts
 * @summary Specifically for deletion but now can be used for generic prompts
 * @param  {IActionPrompt} actionPromptParam - Object named parameter
 * @return {Promise<void>} void.
 */
export const actionPrompt: IActionPrompt = async ({
	isGeneric,
	genericMsg,
	genericTitle,
	customCallback,
	customCallbackParams,
	_id,
	api_url,
	context,
	extraCallback,
	setDataAllPage,
	setDataPage,
}) => {
	const random = randomBytes(8).toString("hex");
	const validateInput = () => {
		const inputVal = document.getElementById(`action-input-${random}`) as HTMLInputElement;
		if (inputVal.value === random.toString()) {
			closeAllModals();
			if (!customCallback) actuallyDeleteTheData(_id!, api_url!, setDataPage, setDataAllPage, extraCallback);
			else {
				if (customCallbackParams) customCallback(customCallbackParams);
				else customCallback();
			}
		} else {
			showNotification({ message: "Invalid code inputted", color: "red", autoClose: 3000 });
		}
	};

	openConfirmModal({
		title: `${isGeneric ? (genericTitle ? genericTitle : "Action") : "Delete"} Confirmation`,
		children: (
			<Text size="sm">
				<Text component="span" weight={700}>
					Are you sure
				</Text>{" "}
				{isGeneric ? (
					`you want to ${genericMsg}`
				) : (
					<>
						you want to delete this {context}? This action is <Code>irreversible</Code>, <Code>destructive</Code>, and <Code>there is no way to recover the deleted data</Code>
					</>
				)}
				.
			</Text>
		),
		labels: { confirm: `Yes, ${isGeneric ? "confirm action" : `delete ${context}`}`, cancel: "No, cancel" },
		confirmProps: { color: "red" },
		closeOnConfirm: false,
		onCancel: () => {},
		onConfirm: () =>
			openModal({
				title: "Second Confirmation",
				children: (
					<>
						<Text size={"sm"}>
							Please type <Code>{random}</Code> to confirm {isGeneric ? (genericTitle ? genericTitle.toLowerCase() : "action") : "deletion"}.
						</Text>

						<TextInput mt={8} id={`action-input-${random}`} data-autofocus />
						<Button fullWidth onClick={() => validateInput()} mt="md" color={"red"}>
							Submit {isGeneric ? (genericTitle ? genericTitle : "Action") : "Delete"}
						</Button>
					</>
				),
			}),
	});
};

const actuallyDeleteTheData: IDeleteData = async (_id, api_url, setDataPage?, setDataAllPage?, extraCallback?) => {
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
			if (setDataPage) setDataPage((prev) => prev.filter((item) => item._id !== _id));
			if (setDataAllPage) setDataAllPage((prev) => prev.filter((item) => item._id !== _id));
			if (extraCallback) extraCallback();
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
