import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { Box, Button, Group, LoadingOverlay, TextInput, Textarea, Chip } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { useStyles_BtnOutline, urlSafeRegex, SERVER_V1, handleSubmitForm, handleDeleteForm, handleResetForm } from "../../../helper";
import { IGroup } from "../../../interfaces/db";
import { TitleDashboard } from "../../Utils/Dashboard";
import Link from "next/link";

interface IGroupFormProps extends IDashboardProps {
	group?: IGroup;
}

export const GroupForm: NextPage<IGroupFormProps> = (props) => {
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
	const resetForm = () => {
		setSubmitted(false);

		if (!props.group) {
			forms.reset();
		} else {
			forms.setValues({
				name: props.group.name,
				description: props.group.description,
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
			const req = await fetch(`${SERVER_V1}/${props.group ? "group/" + props.group._id : "group"}`, {
				method: props.group ? "PUT" : "POST",
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

				setTimeout(() => router.push("../group"), 1500);
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
			if (props.group) {
				// edit mode
				forms.setValues({
					name: props.group.name,
					description: props.group.description,
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
			<TitleDashboard title={props.group ? "View/Edit Group" : "Add Group"} hrefLink="../group" hrefText="Back to groups" HrefIcon={IconArrowLeft} />

			<Box component="div" sx={{ position: "relative" }}>
				<LoadingOverlay visible={loading} overlayBlur={3} />
				<form onSubmit={forms.onSubmit(() => handleSubmitForm(submitForm))}>
					<TextInput
						mt="md"
						required
						label="Name"
						placeholder="Group name"
						{...forms.getInputProps("name")}
						description={`Group name, Characters allowed are Alpha numeric, underscore, hyphen, space, ', ", comma, and @ regex`}
						disabled={!editable}
					/>

					<Textarea
						mt="md"
						required
						label="Description"
						placeholder="Group description"
						{...forms.getInputProps("description")}
						description={`Group description. Minimum character 10`}
						disabled={!editable}
						minLength={10}
					/>

					<Group>
						{props.group && (
							<Link href={`../user?tab=1&group=${props.group!.name.replaceAll(" ", "+")}`}>
								<a>
									<Chip mt="md" checked={false}>
										Click here to view all group members
									</Chip>
								</a>
							</Link>
						)}

						<Group position="right" mt="md" ml="auto">
							{props.group ? (
								<>
									<Button
										color="red"
										onClick={() =>
											handleDeleteForm("forum post", {
												api_url: "forum",
												redirect_url: "../forum",
												id: props.group!._id,
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
