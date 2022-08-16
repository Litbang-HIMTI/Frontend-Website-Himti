import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { Box, Button, createStyles, Group, LoadingOverlay, TextInput, Text, Textarea } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { SERVER_V1, urlSafeRegex } from "../../../helper";
import { IGroup } from "../../../interfaces/db";
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

interface IGroupFormProps extends IDashboardProps {
	group?: IGroup;
}

export const GroupForm: NextPage<IGroupFormProps> = (props) => {
	const { classes } = useStyles();
	const router = useRouter();
	const [loading, setLoading] = useState<boolean>(false);
	const [submitted, setSubmitted] = useState<boolean>(false);
	const [editable, setEditable] = useState<boolean>(false);
	const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
	const [modalHandle, setModalHandle] = useState({ opened: false, closeFunc: () => {}, confirmFunc: () => {} });
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
		setModalHandle({ opened: true, closeFunc: () => resetModalHandle(), confirmFunc: () => deleteGroup() });
	};

	const deleteGroup = async () => {
		setLoading(true);
		setUnsavedChanges(false);
		try {
			const req = await fetch(`${SERVER_V1}/group/${props.group!._id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});
			const { message } = await req.json();

			resetModalHandle();
			if (req.status === 200) {
				setSubmitted(true);
				showNotification({ title: "Group deleted", message: message + ". Redirecting...", disallowClose: true });

				setTimeout(() => router.push("../group"), 1500);
			} else {
				setUnsavedChanges(true);
				setLoading(false);
				resetModalHandle();
				showNotification({ title: "Error", message, color: "red", disallowClose: true });
			}
		} catch (error: any) {
			setUnsavedChanges(true);
			setLoading(false);
			resetModalHandle();
			showNotification({ title: "Error", message: error.message, disallowClose: true, color: "red" });
		}
	};

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
		resetModalHandle();
	};

	const submitForm = async () => {
		setLoading(true);
		setUnsavedChanges(false);
		if (submitted) return;
		const { name, description } = forms.values;

		try {
			const req = await fetch(`${SERVER_V1}/${props.group ? "group/" + props.group._id : "group"}`, {
				method: props.group ? "PUT" : "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name,
					description,
				}),
			});
			const { message } = await req.json();
			resetModalHandle();

			if (req.status === 201 || req.status === 200) {
				setSubmitted(true);
				showNotification({ title: "Success", message: message + ". Redirecting...", disallowClose: true });

				setTimeout(() => router.push("../group"), 1500);
			} else {
				setUnsavedChanges(true);
				setLoading(false);
				resetModalHandle();
				showNotification({ title: "Error", message, disallowClose: true, color: "red" });
			}
		} catch (error: any) {
			setUnsavedChanges(true);
			setLoading(false);
			resetModalHandle();
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
			<MConfirmContinue opened={modalHandle.opened} closeFunc={modalHandle.closeFunc} confirmFunc={modalHandle.confirmFunc} />
			<TitleDashboard title={props.group ? "View/Edit Group" : "Add Group"} hrefAddNew="../group" hrefText="Back to groups" HrefIcon={IconArrowLeft} />

			<Box component="div" sx={{ position: "relative" }} className="dash-textinput-gap">
				<LoadingOverlay visible={loading} overlayBlur={3} />
				<form onSubmit={forms.onSubmit(handleSubmit)}>
					<TextInput
						mt="md"
						required
						label="Title"
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
					/>

					<Group position="right" mt="md">
						{props.group ? (
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
