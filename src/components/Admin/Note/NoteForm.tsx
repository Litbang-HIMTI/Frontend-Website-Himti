import { useState, useEffect, useRef } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { Box, Button, createStyles, Group, LoadingOverlay, TextInput, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { SERVER_V1, urlSafeRegex } from "../../../utils";
import { INote } from "../../../interfaces/db";
import RichText from "../../Utils/RichText";
import { useRouter } from "next/router";
import { Editor } from "@mantine/rte";

const useStyles = createStyles((theme) => ({
	button: {
		"&:hover": {
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
	const handleReset = () => {
		forms.reset();
		setContent("");
		setSubmitted(false);
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

			if (fetchSubmit.status === 201) {
				setSubmitted(true);
				showNotification({
					title: "Success",
					message: "You have created a note successfully. Redirecting...",
					disallowClose: true,
				});

				const { fromDashHome } = router.query;
				setTimeout(() => {
					router.push(fromDashHome === "true" ? "../" : "../note");
				}, 1500);
			} else {
				setLoading(false);
				const { message } = await fetchSubmit.json();
				showNotification({
					title: "Error",
					message,
					disallowClose: true,
				});
			}
		} catch (error: any) {
			setLoading(false);
			showNotification({
				title: "Error",
				message: `${error.message}`,
				disallowClose: true,
			});
		}
	};

	useEffect(() => {
		if (props.note) {
			forms.setValues({
				title: props.note.title,
			});
			setContent(props.note.content);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<div className="dash-flex">
				<h1>Notes</h1>
				<Link href={"../note"}>
					<Button id="dash-add-new" ml={16} size="xs" compact leftIcon={<IconArrowLeft size={20} />}>
						Back to notes
					</Button>
				</Link>
			</div>

			<Box component="div" sx={{ position: "relative" }} className="dash-textinput-gap">
				<LoadingOverlay visible={loading} overlayBlur={3} />
				<form onSubmit={forms.onSubmit(submitForm)}>
					<TextInput
						mt="md"
						required
						label="Title"
						placeholder="Note title"
						{...forms.getInputProps("title")}
						description={`Notes title, Characters allowed are Alpha numeric, underscore, hyphen, space, ', ", comma, and @ regex`}
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
							["alignLeft", "alignCenter", "alignRight"],
						]}
					/>
					<Group position="right" mt="md">
						<Button color="pink" onClick={handleReset}>
							Reset
						</Button>
						<Button variant="outline" className={classes.button} type="submit">
							Submit
						</Button>
					</Group>
				</form>
			</Box>
		</>
	);
};
