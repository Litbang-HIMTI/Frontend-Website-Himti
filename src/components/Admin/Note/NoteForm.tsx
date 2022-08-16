import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { Box, Button, createStyles, Group, LoadingOverlay, TextInput, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { SERVER_V1, urlSafeRegex } from "../../../helper";
import { INote } from "../../../interfaces/db";
import RichText from "../../Utils/Dashboard/RichText";
import { TitleDashboard } from "../../Utils/Dashboard";
import { MConfirmContinue } from "../../Utils/Dashboard/Modals";

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

interface INoteFormProps extends IDashboardProps {
	note?: INote;
}

export const NoteForm: NextPage<INoteFormProps> = (props) => {
	const { classes } = useStyles();
	const router = useRouter();
	const [loading, setLoading] = useState<boolean>(false);
	const [submitted, setSubmitted] = useState<boolean>(false);
	const [editable, setEditable] = useState<boolean>(false);
	const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
	const [modalHandle, setModalHandle] = useState({ opened: false, closeFunc: () => {}, confirmFunc: () => {} });
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
	// handler
	const resetModalHandle = () => {
		setModalHandle({ opened: false, closeFunc: () => {}, confirmFunc: () => {} });
	};
	const handleReset = () => {
		setModalHandle({ opened: true, closeFunc: () => resetModalHandle(), confirmFunc: () => resetForm() });
	};
	const handleSubmit = () => {
		setModalHandle({ opened: true, closeFunc: () => resetModalHandle(), confirmFunc: () => submitForm() });
	};
	const handleDelete = () => {
		setModalHandle({ opened: true, closeFunc: () => resetModalHandle(), confirmFunc: () => deleteNote() });
	};

	const deleteNote = async () => {
		setLoading(true);
		try {
			const res = await fetch(`${SERVER_V1}/note/${props.note!._id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});
			const data = await res.json();

			resetModalHandle();
			if (res.status === 200) {
				setUnsavedChanges(false);
				setSubmitted(true);
				showNotification({ title: "Note deleted", message: "Note has been deleted successfully. Redirecting...", color: "red" });

				const { fromDashHome } = router.query;
				setTimeout(() => {
					router.push(fromDashHome === "true" ? "../" : "../note");
				}, 1500);
			} else {
				showNotification({ title: "Error", message: data.message, color: "red" });
			}
			setLoading(false);
		} catch (err: any) {
			setLoading(false);
			resetModalHandle();
			showNotification({ title: "Error", message: err.message, color: "red" });
		}
	};

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
		resetModalHandle();
	};

	const submitForm = async () => {
		setLoading(true);
		if (submitted) return;
		const { title } = forms.values;
		const editor = document.getElementsByClassName("ql-editor")[0] as HTMLDivElement;

		if (editor.innerText.length - 1 < 25)
			showNotification({
				title: "Error",
				message: "Note must be at least 25 characters long",
				color: "red",
			});

		try {
			const fetchSubmit = await fetch(`${SERVER_V1}/${props.note ? "note/" + props.note._id : "note"}`, {
				method: props.note ? "PUT" : "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title,
					content,
				}),
			});

			resetModalHandle();
			const { message } = await fetchSubmit.json();
			if (fetchSubmit.status === 201 || fetchSubmit.status === 200) {
				setUnsavedChanges(false);
				setSubmitted(true);
				showNotification({
					title: "Success",
					message: message + ". Redirecting...",
					disallowClose: true,
				});

				const { fromDashHome } = router.query;
				setTimeout(() => {
					router.push(fromDashHome === "true" ? "../" : "../note");
				}, 1500);
			} else {
				setLoading(false);
				showNotification({
					title: "Error",
					message,
					disallowClose: true,
				});
			}
		} catch (error: any) {
			resetModalHandle();
			setLoading(false);
			showNotification({
				title: "Error",
				message: `${error.message}`,
				disallowClose: true,
			});
		}
	};

	// ------------------------------------------------------------
	// page open
	useEffect(() => {
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
			<MConfirmContinue opened={modalHandle.opened} closeFunc={modalHandle.closeFunc} confirmFunc={modalHandle.confirmFunc} />
			<TitleDashboard title={props.note ? "View/Edit Note" : "Add Note"} hrefAddNew="../note" hrefText="Back to notes" HrefIcon={IconArrowLeft} />

			<Box component="div" sx={{ position: "relative" }} className="dash-textinput-gap">
				<LoadingOverlay visible={loading} overlayBlur={3} />
				<form onSubmit={forms.onSubmit(handleSubmit)}>
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
							Must be at least 25 characters long.
						</Text>
					</Text>
					<RichText
						id="content"
						placeholder="Content..."
						value={content}
						onChange={setContent}
						mt="xs"
						controls={[
							["bold", "italic", "underline", "link", "blockquote", "codeBlock", "clean"],
							["unorderedList", "orderedList", "h1", "h2", "h3"],
							["sup", "sub"],
						]}
						readOnly={!editable}
					/>
					<Group position="right" mt="md">
						{props.note ? (
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
									{editable ? "Cancel edit" : "Enable Edit"}
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
				</form>
			</Box>
		</>
	);
};
