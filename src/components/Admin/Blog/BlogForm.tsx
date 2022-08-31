import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useForm } from "@mantine/form";
import { showNotification, updateNotification } from "@mantine/notifications";
import { Box, Button, Group, LoadingOverlay, TextInput, Text, Select, Checkbox, MultiSelect, Textarea } from "@mantine/core";
import { IconArrowLeft, IconHistory } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { useStyles_BtnOutline, handleSubmitForm, handleDeleteForm, handleResetForm, imageUrlRegex, urlSafeRegex, SERVER_V1 } from "../../../helper";
import { IBlog, IDCountQRes } from "../../../interfaces/db";
import { MDE, TitleDashboard } from "../../Utils/Dashboard";
import { ISelect } from "../../../interfaces/input";
import Link from "next/link";

interface IBlogFormProps extends IDashboardProps {
	blog?: IBlog;
}

interface blogForm {
	title: string;
	thumbnail: string;
	visibility: string;
	tags: string[];
	description: string;
	pinned: boolean;
	showAtHome: boolean;
}

export const BlogForm: NextPage<IBlogFormProps> = (props) => {
	const { classes } = useStyles_BtnOutline();
	const router = useRouter();
	const [loading, setLoading] = useState<boolean>(false);
	const [submitted, setSubmitted] = useState<boolean>(false);
	const [editable, setEditable] = useState<boolean>(false);
	const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
	const [pageOpenFetched, setPageOpenFetched] = useState<boolean>(false);
	// ------------------------------------------------------------
	const forms = useForm<blogForm>({
		initialValues: {
			title: "",
			thumbnail: "",
			visibility: "public",
			tags: [],
			description: "",
			pinned: false,
			showAtHome: false,
		},

		validate: {
			title: (value) =>
				urlSafeRegex.test(value) ? undefined : "Title contains invalid character. Characters allowed are Alpha numeric, underscore, hyphen, space, ', \", comma, and @ regex",
			thumbnail: (value) => (value.length > 0 ? (imageUrlRegex.test(value) ? undefined : "Invalid image URL") : undefined),
			description: (value) => (value.length > 50 ? undefined : "Description must be at least 50 characters"),
			visibility: (value) => (value.length > 0 ? undefined : "Visibility must be selected"),
			tags: (value) =>
				value.length > 0
					? value.some((v) => urlSafeRegex.test(v))
						? undefined
						: "Tags contains invalid character. Characters allowed are Alpha numeric, underscore, hyphen, space, ', \", comma, and @ regex"
					: "Tags must be selected",
		},
	});
	const [content, setContent] = useState("");
	const [tagsListData, setTagsListData] = useState<ISelect[]>([{ label: "Reload tags data", value: "reload", group: "Utility" }]);

	// ------------------------------------------------------------
	// handler
	const resetForm = () => {
		setSubmitted(false);

		if (!props.blog) {
			forms.reset();
			setContent("");
		} else {
			forms.setValues({
				title: props.blog.title,
				thumbnail: props.blog.thumbnail || "",
				visibility: props.blog.visibility,
				tags: props.blog.tags && props.blog.tags.length > 0 ? (props.blog.tags as any) : [],
				description: props.blog.description,
				pinned: props.blog.pinned,
				showAtHome: props.blog.showAtHome,
			});
			setContent(props.blog.content);
		}
	};

	const submitForm = async () => {
		setLoading(true);
		setUnsavedChanges(false);
		if (submitted) return;
		const { title, thumbnail, visibility, tags, description, pinned, showAtHome } = forms.values;

		try {
			if (content.length < 50) throw new Error("Content is too short. Minimum length is 50 characters.");
			const req = await fetch(`${SERVER_V1}/${props.blog ? "blog/" + props.blog._id : "blog"}`, {
				method: props.blog ? "PUT" : "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: title.trim(),
					content: content.trim(),
					thumbnail: thumbnail.length > 0 ? thumbnail.trim() : undefined,
					visibility: visibility.trim(),
					tags: tags.length > 0 ? tags.map((v) => v.trim()) : undefined,
					description: description.trim(),
					pinned,
					showAtHome,
				}),
			});
			const { message } = await req.json();

			if (req.status === 201 || req.status === 200) {
				setSubmitted(true);
				showNotification({ title: "Success", message: message + ". Redirecting...", disallowClose: true });

				setTimeout(() => router.push("../blog"), 1500);
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

	const fetchTags = async () => {
		showNotification({ id: "tag-load", title: "Loading tags", message: "Please wait...", disallowClose: true, autoClose: false, loading: true });
		try {
			const req = await fetch(`${SERVER_V1}/blog/tags`, {
				method: "GET",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			});
			const { message, data }: IDCountQRes = await req.json();

			if (req.status === 200) {
				setTagsListData((prev) => {
					const newFetch = data.map((tag) => ({ label: tag._id, value: tag._id, group: "Available" }));
					const newData = [...prev, ...newFetch];

					// remove dupe
					const unique = newData.filter((v, i, a) => a.findIndex((t) => t.value === v.value) === i);
					return unique;
				});

				updateNotification({ id: "tag-load", title: "Success", message, disallowClose: false, autoClose: 1500, loading: false });
			} else {
				updateNotification({ id: "tag-load", title: "Error", message, disallowClose: true, color: "red", autoClose: 3500, loading: false });
			}
		} catch (error: any) {
			updateNotification({ id: "tag-load", title: "Error", message: error.message, disallowClose: true, color: "red", autoClose: 3500, loading: false });
		}
	};

	// ------------------------------------------------------------
	// page open
	useEffect(() => {
		if (!pageOpenFetched) {
			fetchTags();
			if (props.blog) {
				// edit mode
				forms.setValues({
					title: props.blog.title,
					thumbnail: props.blog.thumbnail || "",
					visibility: props.blog.visibility,
					tags: props.blog.tags ? props.blog.tags : [],
					description: props.blog.description,
					pinned: props.blog.pinned,
					showAtHome: props.blog.showAtHome,
				});
				setContent(props.blog.content);
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
			<TitleDashboard title={props.blog ? "View/Edit Blog Post" : "Add Blog Post"} hrefLink={"../blog"} hrefText={"Back to blog posts"} HrefIcon={IconArrowLeft} />

			<Box component="div" sx={{ position: "relative" }}>
				<LoadingOverlay visible={loading} overlayBlur={3} />
				<form onSubmit={forms.onSubmit(() => handleSubmitForm(submitForm))}>
					<TextInput
						mt="md"
						required
						label="Title"
						placeholder="Post title"
						{...forms.getInputProps("title")}
						description={`Post title, Characters allowed are Alpha numeric, underscore, hyphen, space, ', ", comma, and @ regex`}
						disabled={!editable}
					/>

					<TextInput
						mt="md"
						label="Thumbnail"
						placeholder="Valid image url"
						{...forms.getInputProps("thumbnail")}
						description={`Post thumbnail URL. leave blank to use default (No thumbnail)`}
						disabled={!editable}
					/>

					<Select
						mt="md"
						label="Visibility"
						placeholder="Post visibility"
						{...forms.getInputProps("visibility")}
						description={`Post visibility`}
						disabled={!editable}
						data={[
							{ label: "Public", value: "public" },
							{ label: "Private", value: "private" },
							{ label: "Draft", value: "draft" },
						]}
						required
						error={forms.errors.visibility}
					/>

					<MultiSelect
						mt="md"
						data={tagsListData}
						description=" "
						placeholder="Tags"
						value={forms.values.tags}
						onChange={(value) => {
							if (value?.includes("reload")) {
								fetchTags();
							} else {
								forms.setFieldValue("tags", value!);
							}
						}}
						label="Post Tags"
						disabled={!editable}
						creatable
						searchable
						getCreateLabel={(q) => `+ Create ${q}`}
						onCreate={(q) => {
							const item = { label: q.trim(), value: q.trim(), group: "New" };
							setTagsListData((prev) => [...prev, item]);
							forms.setFieldValue("tags", [...forms.values.tags, q]);

							return item;
						}}
						maxDropdownHeight={300}
						error={forms.errors.tags}
					/>

					<Textarea
						mt="md"
						label="Description"
						placeholder="Post description"
						{...forms.getInputProps("description")}
						description={`Post description. Minimal 50 characters`}
						disabled={!editable}
						required
						minRows={3}
					/>

					<Checkbox mt="md" label="Pinned" description="Pin this forum post to the top of the forum list" {...forms.getInputProps("pinned")} disabled={!editable} />

					<Checkbox mt="md" label="Show at home" description="Show this forum post on the home page" {...forms.getInputProps("showAtHome")} disabled={!editable} />

					<Text mt="md" size={"sm"}>
						Content{" "}
						<Text color={"red"} component="span">
							*
						</Text>
						<Text color={"dimmed"} size={"xs"}>
							Must be at least 50 characters long
						</Text>
					</Text>
					<MDE content={content} setContent={setContent} editable={!editable} />
					<Group>
						<Group mt="md">
							<Link href={props.pathname?.split("?")[0] + "/revision?fromEdit=true"}>
								<a>
									<Button>
										<IconHistory size={20} />
										<Text component="span" ml={4}>
											View Revision History
										</Text>
									</Button>
								</a>
							</Link>
						</Group>

						<Group position="right" mt="md" ml="auto">
							{props.blog ? (
								<>
									<Button
										color="red"
										onClick={() =>
											handleDeleteForm("blog post", { api_url: "blog", redirect_url: "../blog", id: props.blog!._id, router: router, setLoading, setSubmitted, setUnsavedChanges })
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
