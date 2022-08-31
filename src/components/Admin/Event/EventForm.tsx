import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useForm } from "@mantine/form";
import { showNotification, updateNotification } from "@mantine/notifications";
import { Box, Button, Group, LoadingOverlay, TextInput, Text, Select, Checkbox, MultiSelect, Textarea, NumberInput } from "@mantine/core";
import { IconArrowLeft, IconHistory } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { useStyles_BtnOutline, handleSubmitForm, handleDeleteForm, handleResetForm, imageUrlRegex, urlSafeRegex, SERVER_V1 } from "../../../helper";
import { IEvent, IDCountQRes } from "../../../interfaces/db";
import { MDE, TitleDashboard } from "../../Utils/Dashboard";
import { ISelect } from "../../../interfaces/input";
import Link from "next/link";
import isURL from "validator/lib/isURL";
import isEmail from "validator/lib/isEmail";
import { DatePicker } from "@mantine/dates";

interface IEventFormProps extends IDashboardProps {
	event?: IEvent;
}

interface eventForm {
	title: string;
	thumbnail: string;
	visibility: string;
	price: number;
	startDate: Date;
	endDate: Date;
	location?: string;
	link?: string;
	organizer?: string[];
	tags: string[];
	email?: string;
	description: string;
	pinned: boolean;
	showAtHome: boolean;
}

export const EventForm: NextPage<IEventFormProps> = (props) => {
	const { classes } = useStyles_BtnOutline();
	const router = useRouter();
	const [loading, setLoading] = useState<boolean>(false);
	const [submitted, setSubmitted] = useState<boolean>(false);
	const [editable, setEditable] = useState<boolean>(false);
	const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
	const [pageOpenFetched, setPageOpenFetched] = useState<boolean>(false);
	// ------------------------------------------------------------
	const forms = useForm<eventForm>({
		initialValues: {
			title: "",
			thumbnail: "",
			visibility: "public",
			price: 0,
			startDate: new Date(),
			endDate: new Date(),
			location: "",
			link: "",
			organizer: [],
			tags: [],
			email: "",
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
			link: (value: string) => (value.length > 0 ? (isURL(value) ? undefined : "Invalid link") : undefined),
			organizer: (value: string[]) =>
				value.length > 0
					? value.some((v) => urlSafeRegex.test(v))
						? undefined
						: "Organizer contains invalid character. Characters allowed are Alpha numeric, underscore, hyphen, space, ', \", comma, and @ regex"
					: undefined,
			tags: (value) =>
				value.length > 0
					? value.some((v) => urlSafeRegex.test(v))
						? undefined
						: "Tags contains invalid character. Characters allowed are Alpha numeric, underscore, hyphen, space, ', \", comma, and @ regex"
					: "Tags must be selected",
			email: (value: string) => (value.length > 0 ? (isEmail(value) ? undefined : "Invalid email") : undefined),
			price: (value: number) => (value >= 0 ? undefined : "Price must be greater than or equal to 0"),
		},
	});
	const [content, setContent] = useState("");
	const [tagsListData, setTagsListData] = useState<ISelect[]>([{ label: "Reload tags data", value: "reload", group: "Utility" }]);
	const [organizerListData, setOrganizerListData] = useState<ISelect[]>([{ label: "Reload organizer data", value: "reload", group: "Utility" }]);

	// ------------------------------------------------------------
	// handler
	const resetForm = () => {
		setSubmitted(false);

		if (!props.event) {
			forms.reset();
			setContent("");
		} else {
			forms.setValues({
				title: props.event.title,
				thumbnail: props.event.thumbnail || "",
				visibility: props.event.visibility,
				price: props.event.price,
				startDate: new Date(props.event.startDate),
				endDate: new Date(props.event.endDate),
				location: props.event.location || "",
				link: props.event.link || "",
				tags: props.event.tags && props.event.tags.length > 0 ? props.event.tags : [],
				organizer: props.event.organizer && props.event.organizer.length > 0 ? props.event.organizer : [],
				email: props.event.email || "",
				description: props.event.description,
				pinned: props.event.pinned,
				showAtHome: props.event.showAtHome,
			});
			setContent(props.event.content);
		}
	};

	const submitForm = async () => {
		setLoading(true);
		setUnsavedChanges(false);
		if (submitted) return;
		const { title, thumbnail, visibility, price, startDate, endDate, link, location, organizer, tags, email, description, pinned, showAtHome } = forms.values;

		try {
			if (content.length < 50) throw new Error("Content is too short. Minimum length is 50 characters.");
			const req = await fetch(`${SERVER_V1}/${props.event ? "event/" + props.event._id : "event"}`, {
				method: props.event ? "PUT" : "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: title.trim(),
					content: content.trim(),
					thumbnail: thumbnail.length > 0 ? thumbnail.trim() : undefined,
					visibility: visibility.trim(),
					price,
					startDate,
					endDate,
					link: link!.length > 0 ? link!.trim() : undefined,
					location: location!.length > 0 ? location!.trim() : undefined,
					organizer: organizer!.length > 0 ? organizer!.map((o) => o.trim()) : undefined,
					tags: tags.length > 0 ? tags.map((v) => v.trim()) : undefined,
					email: email!.length > 0 ? email!.trim() : undefined,
					description: description.trim(),
					pinned,
					showAtHome,
				}),
			});
			const { message } = await req.json();

			if (req.status === 201 || req.status === 200) {
				setSubmitted(true);
				showNotification({ title: "Success", message: message + ". Redirecting...", disallowClose: true });

				setTimeout(() => router.push("../event"), 1500);
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
			const req = await fetch(`${SERVER_V1}/event/tags`, {
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

	const fetchOrganizer = async () => {
		showNotification({ id: "organizer-load", title: "Loading organizer", message: "Please wait...", disallowClose: true, autoClose: false, loading: true });
		try {
			const req = await fetch(`${SERVER_V1}/event/organizer`, {
				method: "GET",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			});
			const { message, data }: IDCountQRes = await req.json();

			if (req.status === 200) {
				setOrganizerListData((prev) => {
					const newFetch = data.map((tag) => ({ label: tag._id, value: tag._id, group: "Available" }));
					const newData = [...prev, ...newFetch];

					// remove dupe
					const unique = newData.filter((v, i, a) => a.findIndex((t) => t.value === v.value) === i);
					return unique;
				});
				updateNotification({ id: "organizer-load", title: "Success", message, disallowClose: false, autoClose: 1500, loading: false });
			} else {
				updateNotification({ id: "organizer-load", title: "Error", message, disallowClose: true, color: "red", autoClose: 3500, loading: false });
			}
		} catch (error: any) {
			updateNotification({ id: "organizer-load", title: "Error", message: error.message, disallowClose: true, color: "red", autoClose: 3500, loading: false });
		}
	};

	// ------------------------------------------------------------
	// page open
	useEffect(() => {
		if (!pageOpenFetched) {
			fetchTags();
			fetchOrganizer();
			if (props.event) {
				// edit mode
				forms.setValues({
					title: props.event.title,
					thumbnail: props.event.thumbnail || "",
					visibility: props.event.visibility,
					price: props.event.price,
					startDate: new Date(props.event.startDate),
					endDate: new Date(props.event.endDate),
					location: props.event.location || "",
					link: props.event.link || "",
					tags: props.event.tags && props.event.tags.length > 0 ? props.event.tags : [],
					organizer: props.event.organizer && props.event.organizer.length > 0 ? props.event.organizer : [],
					description: props.event.description,
					email: props.event.email || "",
					pinned: props.event.pinned,
					showAtHome: props.event.showAtHome,
				});
				setContent(props.event.content);
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
			<TitleDashboard title={props.event ? "View/Edit Blog Post" : "Add Blog Post"} hrefLink={"../blog"} hrefText={"Back to blog posts"} HrefIcon={IconArrowLeft} />

			<Box component="div" sx={{ position: "relative" }}>
				<LoadingOverlay visible={loading} overlayBlur={3} />
				<form onSubmit={forms.onSubmit(() => handleSubmitForm(submitForm))}>
					<TextInput
						mt="md"
						required
						label="Title"
						placeholder="Post title"
						{...forms.getInputProps("title")}
						description={`Event title, Characters allowed are Alpha numeric, underscore, hyphen, space, ', ", comma, and @ regex`}
						disabled={!editable}
					/>

					<TextInput
						mt="md"
						label="Thumbnail"
						placeholder="Valid image url"
						{...forms.getInputProps("thumbnail")}
						description={`Event thumbnail URL. leave blank to use default (No thumbnail)`}
						disabled={!editable}
					/>

					<Select
						mt="md"
						label="Visibility"
						placeholder="Event visibility"
						{...forms.getInputProps("visibility")}
						description={`Event visibility`}
						disabled={!editable}
						data={[
							{ label: "Public", value: "public" },
							{ label: "Private", value: "private" },
							{ label: "Draft", value: "draft" },
						]}
						required
						error={forms.errors.visibility}
					/>

					<NumberInput
						mt="md"
						label="Price"
						placeholder="Event price"
						{...forms.getInputProps("price")}
						description={`Event price`}
						disabled={!editable}
						min={0}
						required
						error={forms.errors.price}
					/>

					<DatePicker
						mt="md"
						label="Start Date"
						placeholder="Event start date"
						{...forms.getInputProps("startDate")}
						description={`Event start date`}
						disabled={!editable}
						required
						error={forms.errors.startDate}
					/>

					<DatePicker
						mt="md"
						label="End Date"
						placeholder="Event end date"
						{...forms.getInputProps("endDate")}
						description={`Event end date`}
						disabled={!editable}
						required
						error={forms.errors.endDate}
					/>

					<TextInput mt="md" label="Location" placeholder="Event location" {...forms.getInputProps("location")} description={`Event location`} disabled={!editable} />

					<TextInput mt="md" label="Link" placeholder="Event link" {...forms.getInputProps("link")} description={`Event link`} disabled={!editable} />

					<MultiSelect
						mt="md"
						data={organizerListData}
						description=" "
						placeholder="Organizer"
						value={forms.values.organizer}
						onChange={(value) => {
							if (value?.includes("reload")) {
								fetchOrganizer();
							} else {
								forms.setFieldValue("organizer", value!);
							}
						}}
						label="Organizer"
						disabled={!editable}
						creatable
						searchable
						getCreateLabel={(q) => `+ Create ${q}`}
						onCreate={(q) => {
							const item = { label: q.trim(), value: q.trim(), group: "New" };
							setOrganizerListData((prev) => [...prev, item]);
							forms.setFieldValue("organizer", [...forms.values.organizer!, q]);

							return item;
						}}
						maxDropdownHeight={300}
						error={forms.errors.organizer}
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

					<TextInput mt="md" label="Email" placeholder="Event email" {...forms.getInputProps("email")} description={`Event email`} disabled={!editable} />

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
							{props.event ? (
								<>
									<Button
										color="red"
										onClick={() =>
											handleDeleteForm("event", { api_url: "event", redirect_url: "../event", id: props.event!._id, router: router, setLoading, setSubmitted, setUnsavedChanges })
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
