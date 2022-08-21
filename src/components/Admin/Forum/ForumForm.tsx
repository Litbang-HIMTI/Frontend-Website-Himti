import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { Box, Button, createStyles, Group, LoadingOverlay, TextInput, Text, Select, Checkbox } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { SERVER_V1, urlSafeRegex } from "../../../helper";
import { ForumCategoryQRes, IForum, INote } from "../../../interfaces/db";
import { MDE, TitleDashboard } from "../../Utils/Dashboard";
import { openConfirmModal } from "@mantine/modals";
import { ISelect } from "../../../interfaces/input";

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
	forum?: IForum;
}

export const ForumForm: NextPage<INoteFormProps> = (props) => {
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
			title: "",
			category: "",
			locked: false,
			pinned: false,
			showAtHome: false,
		},

		validate: {
			title: (value) =>
				urlSafeRegex.test(value) ? undefined : "Title contains invalid character. Characters allowed are Alpha numeric, underscore, hyphen, space, ', \", comma, and @ regex",
		},
	});
	const [content, setContent] = useState("");
	const [categoryListData, setCategoryListData] = useState<ISelect[]>([{ label: "Reload category data", value: "reload", group: "Utility" }]);

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
			children: <Text size="sm">Are you sure you want to delete this forum post? This action is irreversible, destructive, and there is no way to recover the deleted data.</Text>,
			labels: { confirm: "Yes, delete forum post", cancel: "No, cancel" },
			confirmProps: { color: "red" },
			onCancel: () => {},
			onConfirm: () => deleteForm(),
		});
	};

	const deleteForm = async () => {
		setLoading(true);
		setUnsavedChanges(false);
		try {
			const req = await fetch(`${SERVER_V1}/forum/${props.forum!._id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});
			const { message } = await req.json();

			if (req.status === 200) {
				setSubmitted(true);
				showNotification({ title: "Forum post deleted", message: message + ". Redirecting...", disallowClose: true });
				setTimeout(() => router.push("../forum"), 1500);
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

	const resetForm = () => {
		setSubmitted(false);

		if (!props.forum) {
			forms.reset();
			setContent("");
		} else {
			forms.setValues({
				title: props.forum.title,
				category: props.forum.category[0] ? props.forum.category[0]._id : "",
				locked: props.forum.locked,
				pinned: props.forum.pinned,
				showAtHome: props.forum.showAtHome,
			});
			setContent(props.forum.content);
		}
	};

	const submitForm = async () => {
		setLoading(true);
		setUnsavedChanges(false);
		if (submitted) return;
		const { title, category, locked, pinned, showAtHome } = forms.values;

		try {
			if (category.length === 0) throw new Error("Category is required");
			if (content.length < 15) throw new Error("Content is too short. Minimum length is 15 characters.");
			const req = await fetch(`${SERVER_V1}/${props.forum ? "forum/" + props.forum._id : "forum"}`, {
				method: props.forum ? "PUT" : "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: title.trim(),
					content: content.trim(),
					category,
					locked,
					pinned,
					showAtHome,
				}),
			});
			const { message } = await req.json();

			if (req.status === 201 || req.status === 200) {
				setSubmitted(true);
				showNotification({ title: "Success", message: message + ". Redirecting...", disallowClose: true });

				const { fromDashHome } = router.query;
				setTimeout(() => router.push(fromDashHome === "true" ? "../" : "../forum"), 1500);
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

	const fetchCategories = async () => {
		showNotification({ title: "Loading categories", message: "Please wait...", disallowClose: true, autoClose: 1000 });
		try {
			const req = await fetch(`${SERVER_V1}/forum_category`, {
				method: "GET",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			});
			const { message, data }: ForumCategoryQRes = await req.json();

			if (req.status === 200) {
				setCategoryListData((prev) => {
					const newFetch = data.map((group) => ({ label: group.name, value: group._id, group: "Available" }));
					const newData = [...prev, ...newFetch];

					// remove dupe
					const unique = newData.filter((v, i, a) => a.findIndex((t) => t.value === v.value) === i);
					return unique;
				});

				showNotification({ title: "Success", message, disallowClose: false, autoClose: 1000 });
			} else {
				showNotification({ title: "Error", message, disallowClose: true, color: "red" });
			}
		} catch (error: any) {
			showNotification({ title: "Error", message: error.message, disallowClose: true, color: "red" });
		}
	};

	// ------------------------------------------------------------
	// page open
	useEffect(() => {
		if (!pageOpenFetched) {
			fetchCategories();
			if (props.forum) {
				// edit mode
				forms.setValues({
					title: props.forum.title,
					category: props.forum.category[0] ? props.forum.category[0]._id : "",
					locked: props.forum.locked,
					pinned: props.forum.pinned,
					showAtHome: props.forum.showAtHome,
				});
				setContent(props.forum.content);
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
			<TitleDashboard title={props.forum ? "View/Edit Forum Post" : "Add Forum Post"} hrefLink={"../forum"} hrefText={"Back to forum posts"} HrefIcon={IconArrowLeft} />

			<Box component="div" sx={{ position: "relative" }}>
				<LoadingOverlay visible={loading} overlayBlur={3} />
				<form onSubmit={forms.onSubmit(handleSubmit)}>
					<TextInput
						mt="md"
						required
						label="Title"
						placeholder="Forum Post title"
						{...forms.getInputProps("title")}
						description={`Forum Post title, Characters allowed are Alpha numeric, underscore, hyphen, space, ', ", comma, and @ regex`}
						disabled={!editable}
					/>

					<Select
						mt="md"
						data={categoryListData}
						description=" "
						placeholder="Category"
						value={forms.values.category}
						onChange={(value) => {
							if (value?.includes("reload")) {
								fetchCategories();
							} else {
								forms.setFieldValue("category", value!);
							}
						}}
						label="Forum Category"
						disabled={!editable}
						creatable
						searchable
						getCreateLabel={(q) => `+ Create ${q} (open from forum category page)`}
						onCreate={(q) => {
							window.open(`../forum/category/create?name=${q}`, "_blank");
							return "";
						}}
						maxDropdownHeight={300}
					/>

					<Checkbox mt="md" label="Locked" description="Lock this forum post so no one can reply to it" {...forms.getInputProps("locked")} disabled={!editable} />

					<Checkbox mt="md" label="Pinned" description="Pin this forum post to the top of the forum list" {...forms.getInputProps("pinned")} disabled={!editable} />

					<Checkbox mt="md" label="Show at home" description="Show this forum post on the home page" {...forms.getInputProps("showAtHome")} disabled={!editable} />

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
						{props.forum ? (
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
				</form>
			</Box>
		</>
	);
};
