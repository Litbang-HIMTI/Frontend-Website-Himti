import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { Box, Button, createStyles, Group, LoadingOverlay, TextInput, Text, Code } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import isURL from "validator/lib/isURL";
import { SERVER_V1, urlSaferRegex } from "../../../helper";
import { IShortlink } from "../../../interfaces/db";
import { TitleDashboard } from "../../Utils/Dashboard";
import { openConfirmModal } from "@mantine/modals";
import Link from "next/link";

const useStyles = createStyles((theme) => ({
	buttonCancel: {
		"&:hover": {
			// yellow
			backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[0],
		},
	},

	buttonSubmit: {
		// only hover when not disabled
		"&:not([disabled]):hover": {
			backgroundColor: theme.colorScheme === "dark" ? "rgba(51, 154, 240, 0.25);" : "rgba(51, 154, 240, 0.1);",
		},
	},
}));

interface ISHortlinkFormProps extends IDashboardProps {
	shortlink?: IShortlink;
}

export const ShortlinkForm: NextPage<ISHortlinkFormProps> = (props) => {
	const { classes } = useStyles();
	const router = useRouter();
	const [loading, setLoading] = useState<boolean>(false);
	const [submitted, setSubmitted] = useState<boolean>(false);
	const [editable, setEditable] = useState<boolean>(false);
	const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
	const [pageOpenFetched, setPageOpenFetched] = useState<boolean>(false);
	const [host, setHost] = useState<string>("");

	// ------------------------------------------------------------
	const forms = useForm({
		initialValues: {
			originalUrl: "",
			shorten: "",
		},

		validate: {
			originalUrl: (value) => (isURL(value) ? undefined : "Invalid URL"),
			shorten: (value) =>
				urlSaferRegex.test(value) ? undefined : "Title contains invalid character. Characters allowed are Alpha numeric, underscore, hyphen, space, ', \", comma, and @ regex",
		},
	});

	// ------------------------------------------------------------
	// handler
	const handleReset = () => {
		openConfirmModal({
			title: "Reset confirmation",
			children: <Text size="sm">Are you sure you want to reset the form to its initial state? This action is irreversible.</Text>,
			labels: { confirm: "Yes, reset form", cancel: "No, cancel" },
			confirmProps: { color: "red" },
			onCancel: () => {},
			onConfirm: () => resetForm(),
		});
	};
	const handleSubmit = () => {
		openConfirmModal({
			title: "Submit confirmation",
			children: <Text size="sm">Are you sure you want to submit the form? This action is irreversible.</Text>,
			labels: { confirm: "Yes, submit form", cancel: "No, cancel" },
			confirmProps: { color: "red" },
			onCancel: () => {},
			onConfirm: () => submitForm(),
		});
	};
	const handleDelete = () => {
		openConfirmModal({
			title: "Delete confirmation",
			children: <Text size="sm">Are you sure you want to delete this shorten link? This action is irreversible, destructive, and there is no way to recover the deleted data.</Text>,
			labels: { confirm: "Yes, delete shorten link", cancel: "No, cancel" },
			confirmProps: { color: "red" },
			onCancel: () => {},
			onConfirm: () => deleteForm(),
		});
	};

	const deleteForm = async () => {
		setLoading(true);
		setUnsavedChanges(false);
		try {
			const req = await fetch(`${SERVER_V1}/shortlink/${props.shortlink!._id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});
			const { message } = await req.json();

			if (req.status === 200) {
				setSubmitted(true);
				showNotification({ title: "Shorten link deleted", message: message + ". Redirecting...", disallowClose: true });

				setTimeout(() => router.push("../shortlink"), 1500);
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

	const resetForm = () => {
		setSubmitted(false);

		if (!props.shortlink) {
			forms.reset();
		} else {
			forms.setValues({
				originalUrl: props.shortlink.url,
				shorten: props.shortlink.shorten,
			});
		}
	};

	const submitForm = async () => {
		setLoading(true);
		setUnsavedChanges(false);
		if (submitted) return;
		const { originalUrl, shorten } = forms.values;

		try {
			const req = await fetch(`${SERVER_V1}/${props.shortlink ? "shortlink/" + props.shortlink._id : "shortlink"}`, {
				method: props.shortlink ? "PUT" : "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					url: originalUrl.trim(),
					shorten: shorten.trim(),
				}),
			});
			const { message } = await req.json();

			if (req.status === 201 || req.status === 200) {
				setSubmitted(true);
				showNotification({ title: "Success", message: message + ". Redirecting...", disallowClose: true });

				setTimeout(() => router.push("../shortlink"), 1500);
			} else {
				setUnsavedChanges(true);
				setLoading(false);
				showNotification({ title: "Error", message, disallowClose: true, color: "red" });
			}
		} catch (error: any) {
			setUnsavedChanges(true);
			setLoading(false);
			showNotification({ title: "Error", message: error.message, disallowClose: true, color: "red" });
		}
	};

	// ------------------------------------------------------------
	// page open
	useEffect(() => {
		if (!pageOpenFetched) {
			if (props.shortlink) {
				// edit mode
				forms.setValues({
					originalUrl: props.shortlink.url,
					shorten: props.shortlink.shorten,
				});
			} else {
				// create mode
				setUnsavedChanges(true);
				setEditable(true);
			}

			if (router.query.name) {
				forms.setFieldValue("name", router.query.name as string);
			}

			setHost(window.location.host);
			setPageOpenFetched(true);
		}
		// ------------------------------------------------------------
		// on page leave
		const warningText = "You might have unsaved changes - are you sure you wish to leave this page?";
		const handleWindowClose = (e: BeforeUnloadEvent) => {
			if (!unsavedChanges) return;
			e.preventDefault();
			return (e.returnValue = warningText);
		};
		const handleBrowseAway = () => {
			if (!unsavedChanges) return;
			if (window.confirm(warningText)) return;
			router.events.emit("routeChangeError");
			throw "routeChange aborted.";
		};

		window.addEventListener("beforeunload", handleWindowClose);
		router.events.on("routeChangeStart", handleBrowseAway);
		return () => {
			window.removeEventListener("beforeunload", handleWindowClose);
			router.events.off("routeChangeStart", handleBrowseAway);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [unsavedChanges]);

	return (
		<>
			<TitleDashboard title={props.shortlink ? "View/Edit Shortlink" : "Add Shortlink"} hrefLink="../shortlink" hrefText="Back to shortlinks" HrefIcon={IconArrowLeft} />

			<Box component="div" sx={{ position: "relative" }}>
				<LoadingOverlay visible={loading} overlayBlur={3} />
				<form onSubmit={forms.onSubmit(handleSubmit)}>
					<TextInput
						mt="md"
						required
						label="Original URL"
						placeholder="https://example.com"
						{...forms.getInputProps("originalUrl")}
						description={`The URL you want to shorten. Must be a valid URL`}
						disabled={!editable}
					/>

					<TextInput
						mt="md"
						required
						label="Shorten URL"
						placeholder="shorten_url"
						{...forms.getInputProps("shorten")}
						description={`The shortened URL. Characters allowed are Alpha numeric, underscore, hyphen, space, ', ", comma, and @ regex.`}
						disabled={!editable}
					/>

					<Group>
						<Group>
							<Text mt={"md"} size={"sm"}>
								{forms.values.shorten.length > 0 && (
									<>
										Shorten URL will be{" "}
										<Code>
											{host}/s/{forms.values.shorten}
										</Code>
									</>
								)}
								{forms.values.shorten.length > 0 && forms.values.originalUrl.length > 0 && <br />}
								{forms.values.originalUrl.length > 0 && (
									<>
										It will redirect to <Code>{forms.values.originalUrl}</Code>
									</>
								)}
							</Text>
						</Group>

						<Group position="right" mt="md" ml="auto">
							{props.shortlink ? (
								<>
									<Button color="red" onClick={handleDelete}>
										Delete
									</Button>
									<Button
										color="yellow"
										variant="outline"
										className={classes.buttonCancel}
										onClick={() => {
											setUnsavedChanges(true);
											setEditable(!editable);
										}}
									>
										{editable ? "Disable edit" : "Enable Edit"}
									</Button>
									<Button color="pink" onClick={handleReset} disabled={!editable}>
										Reset changes
									</Button>
									<Button variant="outline" className={classes.buttonSubmit} type="submit" disabled={!editable}>
										Submit Edit
									</Button>
								</>
							) : (
								<>
									<Button color="pink" onClick={handleReset}>
										Reset
									</Button>
									<Button variant="outline" className={classes.buttonSubmit} type="submit">
										Submit
									</Button>
								</>
							)}
						</Group>
					</Group>
				</form>
			</Box>
		</>
	);
};