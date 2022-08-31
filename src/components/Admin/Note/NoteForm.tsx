import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { Box, Button, Group, LoadingOverlay, TextInput, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { useStyles_BtnOutline, urlSafeRegex, SERVER_V1, handleSubmitForm, handleDeleteForm, handleResetForm } from "../../../helper";
import { INote } from "../../../interfaces/db";
import { MDE, TitleDashboard } from "../../Utils/Dashboard";

interface INoteFormProps extends IDashboardProps {
	note?: INote;
}

export const NoteForm: NextPage<INoteFormProps> = (props) => {
	const { classes } = useStyles_BtnOutline();
	const router = useRouter();
	const [loading, setLoading] = useState<boolean>(false);
	const [submitted, setSubmitted] = useState<boolean>(false);
	const [editable, setEditable] = useState<boolean>(false);
	const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
	const [pageOpenFetched, setPageOpenFetched] = useState<boolean>(false);
	// ------------------------------------------------------------
	const forms = useForm({
		initialValues: {
			title: "",
		},

		validate: {
			title: (value) =>
				urlSafeRegex.test(value) ? undefined : "Title contains invalid character. Characters allowed are Alpha numeric, underscore, hyphen, space, ', \", comma, and @ regex",
		},
	});
	const [content, setContent] = useState("");

	// ------------------------------------------------------------
	const resetForm = () => {
		setSubmitted(false);

		if (!props.note) {
			forms.reset();
			setContent("");
		} else {
			forms.setValues({
				title: props.note.title,
			});
			setContent(props.note.content);
		}
	};

	const submitForm = async () => {
		setLoading(true);
		setUnsavedChanges(false);
		if (submitted) return;
		const { title } = forms.values;
		try {
			if (content.length < 15) throw new Error("Content is too short. Minimum length is 15 characters.");
			const req = await fetch(`${SERVER_V1}/${props.note ? "note/" + props.note._id : "note"}`, {
				method: props.note ? "PUT" : "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: title.trim(),
					content: content.trim(),
				}),
			});
			const { message } = await req.json();

			if (req.status === 201 || req.status === 200) {
				setSubmitted(true);
				showNotification({ title: "Success", message: message + ". Redirecting...", disallowClose: true });

				const { fromDashHome } = router.query;
				setTimeout(() => router.push(fromDashHome === "true" ? "../" : "../note"), 1500);
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
			if (props.note) {
				// edit mode
				forms.setValues({
					title: props.note.title,
				});
				setContent(props.note.content);
			} else {
				// create mode
				setUnsavedChanges(true);
				setEditable(true);
			}
		}
		setPageOpenFetched(true);
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
			<TitleDashboard
				title={props.note ? "View/Edit Note" : "Add Note"}
				hrefLink={router.query.fromDashHome === "true" ? "../" : "../note"}
				hrefText={router.query.fromDashHome === "true" ? "Back to home" : "Back to notes"}
				HrefIcon={IconArrowLeft}
			/>

			<Box component="div" sx={{ position: "relative" }}>
				<LoadingOverlay visible={loading} overlayBlur={3} />
				<form onSubmit={forms.onSubmit(() => handleSubmitForm(submitForm))}>
					<TextInput
						mt="md"
						required
						label="Title"
						placeholder="Note title"
						{...forms.getInputProps("title")}
						description={`Notes title, Characters allowed are Alpha numeric, underscore, hyphen, space, ', ", comma, and @ regex`}
						disabled={!editable}
					/>

					<Text mt="md" size={"sm"}>
						Content{" "}
						<Text color={"red"} component="span">
							*
						</Text>
						<Text color={"dimmed"} size={"xs"}>
							Must be at least 15 characters long.
						</Text>
					</Text>
					<MDE content={content} setContent={setContent} editable={!editable} />
					<Group position="right" mt="md">
						{props.note ? (
							<>
								<Button
									color="red"
									onClick={() =>
										handleDeleteForm("note", {
											api_url: "note",
											redirect_url: router.query.fromDashHome === "true" ? "../" : "../note",
											id: props.note!._id,
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
				</form>
			</Box>
		</>
	);
};
