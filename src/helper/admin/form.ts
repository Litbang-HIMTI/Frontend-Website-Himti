import { showNotification } from "@mantine/notifications";
import { NextRouter } from "next/router";
import { SetStateAction } from "react";
import { SERVER_V1 } from "../global/constants";
import { actionPrompt } from "./fetchData";

export const handleResetForm = (customCallback: (data?: any) => void) => {
	actionPrompt({
		isGeneric: true,
		genericTitle: "Reset",
		genericMsg: "reset the form to its initial state? This action is irreversible.",
		customCallback,
	});
};

export const handleSubmitForm = (customCallback: (data?: any) => void) => {
	actionPrompt({
		isGeneric: true,
		genericTitle: "Submit",
		genericMsg: "submit the form? This action is irreversible.",
		customCallback,
	});
};

interface IdeleteForm {
	setLoading: (value: SetStateAction<boolean>) => void;
	setUnsavedChanges: (value: SetStateAction<boolean>) => void;
	setSubmitted: (value: SetStateAction<boolean>) => void;
	context?: string;
	id: string;
	api_url: string;
	redirect_url: string;
	router: NextRouter;
}

export const handleDeleteForm = (context: string, customCallbackParams: IdeleteForm) => {
	const cbCustom = { ...customCallbackParams, context };

	actionPrompt({
		context,
		customCallback: deleteForm,
		customCallbackParams: cbCustom,
	});
};

const deleteForm = async ({ setLoading, setUnsavedChanges, setSubmitted, context, id, api_url, redirect_url, router }: IdeleteForm) => {
	setLoading(true);
	setUnsavedChanges(false);
	try {
		const req = await fetch(`${SERVER_V1}/${api_url}/${id}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});
		const { message } = await req.json();

		if (req.status === 200) {
			setSubmitted(true);
			showNotification({ title: `${context!.charAt(0).toUpperCase() + context!.slice(1)} deleted`, message: message + ". Redirecting...", disallowClose: true });

			setTimeout(() => router.push(redirect_url), 1500);
		} else {
			setUnsavedChanges(true);
			setLoading(false);
			showNotification({ title: "Error", message, color: "red", disallowClose: true });
		}
	} catch (error: any) {
		setUnsavedChanges(true);
		setLoading(false);
		showNotification({ title: "Error", message: error.message, disallowClose: true, color: "red" });
	}
};
