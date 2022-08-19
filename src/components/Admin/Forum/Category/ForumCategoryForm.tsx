import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { Box, Button, createStyles, Group, LoadingOverlay, TextInput, Text, Textarea, Chip } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons";
import { IDashboardProps } from "../../../../interfaces/props/Dashboard";
import { SERVER_V1, urlSafeRegex } from "../../../../helper";
import { IForumCategory } from "../../../../interfaces/db";
import { TitleDashboard } from "../../../Utils/Dashboard";
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

interface IForumCategoryFormProps extends IDashboardProps {
	forum_category?: IForumCategory;
}

export const ForumCategoryForm: NextPage<IForumCategoryFormProps> = (props) => {
	const { classes } = useStyles();
	const router = useRouter();
	const [loading, setLoading] = useState<boolean>(false);
	const [submitted, setSubmitted] = useState<boolean>(false);
	const [editable, setEditable] = useState<boolean>(false);
	const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
	const [pageOpenFetched, setPageOpenFetched] = useState<boolean>(false);

	// ------------------------------------------------------------
	const forms = useForm({
		initialValues: {
			name: "",
			description: "",
		},

		validate: {
			name: (value) =>
				urlSafeRegex.test(value) ? undefined : "Title contains invalid character. Characters allowed are Alpha numeric, underscore, hyphen, space, ', \", comma, and @ regex",
			description: (value) => (value.length > 10 ? undefined : "Description is required (minimal 10 character"),
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
			children: <Text size="sm">Are you sure you want to delete this forum category? This action is irreversible, destructive, and there is no way to recover the deleted data.</Text>,
			labels: { confirm: "Yes, delete forum category", cancel: "No, cancel" },
			confirmProps: { color: "red" },
			onCancel: () => {},
			onConfirm: () => deleteForm(),
		});
	};

	const deleteForm = async () => {
		setLoading(true);
		setUnsavedChanges(false);
		try {
			const req = await fetch(`${SERVER_V1}/forum_category/${props.forum_category!._id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});
			const { message } = await req.json();

			if (req.status === 200) {
				setSubmitted(true);
				showNotification({ title: "Forum category deleted", message: message + ". Redirecting...", disallowClose: true });

				setTimeout(() => router.push("../category"), 1500);
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

		if (!props.forum_category) {
			forms.reset();
		} else {
			forms.setValues({
				name: props.forum_category.name,
				description: props.forum_category.description,
			});
		}
	};

	const submitForm = async () => {
		setLoading(true);
		setUnsavedChanges(false);
		if (submitted) return;
		const { name, description } = forms.values;

		try {
			if (description.trim().length < 10) throw new Error("Description is required (minimal 10 character");
			const req = await fetch(`${SERVER_V1}/${props.forum_category ? "forum_category/" + props.forum_category._id : "forum_category"}`, {
				method: props.forum_category ? "PUT" : "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: name.trim(),
					description: description.trim(),
				}),
			});
			const { message } = await req.json();

			if (req.status === 201 || req.status === 200) {
				setSubmitted(true);
				showNotification({ title: "Success", message: message + ". Redirecting...", disallowClose: true });

				setTimeout(() => router.push("../category"), 1500);
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
			if (props.forum_category) {
				// edit mode
				forms.setValues({
					name: props.forum_category.name,
					description: props.forum_category.description,
				});
			} else {
				// create mode
				setUnsavedChanges(true);
				setEditable(true);
			}

			if (router.query.name) {
				forms.setFieldValue("name", router.query.name as string);
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
			<TitleDashboard title={props.forum_category ? "View/Edit Forum Category" : "Add Forum Category"} hrefLink="../categoru" hrefText="Back to Forum Categories" HrefIcon={IconArrowLeft} />

			<Box component="div" sx={{ position: "relative" }}>
				<LoadingOverlay visible={loading} overlayBlur={3} />
				<form onSubmit={forms.onSubmit(handleSubmit)}>
					<TextInput
						mt="md"
						required
						label="Name"
						placeholder="Forum Category Name"
						{...forms.getInputProps("name")}
						description={`Forum category name, Characters allowed are Alpha numeric, underscore, hyphen, space, ', ", comma, and @ regex`}
						disabled={!editable}
					/>

					<Textarea
						mt="md"
						required
						label="Description"
						placeholder="Description"
						{...forms.getInputProps("description")}
						description={`Forum category description. Minimum character 10`}
						disabled={!editable}
						minLength={10}
					/>

					<Group>
						{props.forum_category && (
							<Link href={`../../forum?tab=1&category=${props.forum_category!.name.replaceAll(" ", "+")}`}>
								<a>
									<Chip mt="md" checked={false}>
										Click here to view all post with this category
									</Chip>
								</a>
							</Link>
						)}

						<Group position="right" mt="md" ml="auto">
							{props.forum_category ? (
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
