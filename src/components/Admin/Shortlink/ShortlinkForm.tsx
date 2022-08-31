import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { Box, Button, Group, LoadingOverlay, TextInput, Text, Code } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import isURL from "validator/lib/isURL";
import { useStyles_BtnOutline, urlSaferRegex, SERVER_V1, handleSubmitForm, handleDeleteForm, handleResetForm } from "../../../helper";
import { IShortlink } from "../../../interfaces/db";
import { TitleDashboard } from "../../Utils/Dashboard";

interface ISHortlinkFormProps extends IDashboardProps {
	shortlink?: IShortlink;
}

export const ShortlinkForm: NextPage<ISHortlinkFormProps> = (props) => {
	const { classes } = useStyles_BtnOutline();
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
				<form onSubmit={forms.onSubmit(() => handleSubmitForm(submitForm))}>
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
									<Button
										color="red"
										onClick={() =>
											handleDeleteForm("shortlink", {
												api_url: "shortlink",
												redirect_url: "../shortlink",
												id: props.shortlink!._id,
												router: router,
												setLoading,
												setSubmitted,
												setUnsavedChanges,
											})
										}
									>
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
									<Button color="pink" onClick={() => handleResetForm(resetForm)} disabled={!editable}>
										Reset changes
									</Button>
									<Button variant="outline" className={classes.buttonSubmit} type="submit" disabled={!editable}>
										Submit Edit
									</Button>
								</>
							) : (
								<>
									<Button color="pink" onClick={() => handleResetForm(resetForm)}>
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
