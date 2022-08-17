import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { Box, Button, createStyles, Group, LoadingOverlay, TextInput, Text, Textarea, Chip, Divider, MultiSelect, PasswordInput } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { emailRegex, SERVER_V1, urlSaferRegex, validatePassword } from "../../../helper";
import { GroupQRes, IUser, IUserForm, validRoles } from "../../../interfaces/db";
import { TitleDashboard } from "../../Utils/Dashboard";
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

interface IUserFormProps extends IDashboardProps {
	userData?: IUser;
}

export const UserForm: NextPage<IUserFormProps> = (props) => {
	const { classes } = useStyles();
	const router = useRouter();
	const [loading, setLoading] = useState<boolean>(false);
	const [submitted, setSubmitted] = useState<boolean>(false);
	const [editable, setEditable] = useState<boolean>(false);
	const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
	const [pageOpenFetched, setPageOpenFetched] = useState<boolean>(false);

	// ------------------------------------------------------------
	const forms = useForm<IUserForm>({
		initialValues: {
			username: "",
			first_name: "",
			last_name: "",
			email: "",
			role: [],
		},

		validate: {
			username: (value) => (urlSaferRegex.test(value) ? undefined : "Invalid username"),
			first_name: (value) => (value.length > 0 ? undefined : "First name is required"),
			last_name: (value) => (value.length > 0 ? undefined : "Last name is required"),
			email: (value) => (emailRegex.test(value) ? undefined : "Invalid email"),
			role: (value) => (value.length > 0 ? undefined : "Role is required"),
		},
	});
	const [group, setGroup] = useState<string[]>([]);
	const [password, setPassword] = useState<string>("");
	const [passwordConfirm, setPasswordConfirm] = useState<string>("");
	const [groupsListData, setGroupsListData] = useState<ISelect[]>([{ label: "Reload group data", value: "reload", group: "Utility" }]);
	const userRoleData = validRoles.map((role) => ({ label: role, value: role }));

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
			children: <Text size="sm">Are you sure you want to delete this user? This action is irreversible, destructive, and there is no way to recover the deleted data.</Text>,
			labels: { confirm: "Yes, delete user", cancel: "No, cancel" },
			confirmProps: { color: "red" },
			onCancel: () => {},
			onConfirm: () => deleteForm(),
		});
	};

	const deleteForm = async () => {
		setLoading(true);
		setUnsavedChanges(false);
		try {
			const req = await fetch(`${SERVER_V1}/user/${props.userData!._id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});
			const { message } = await req.json();

			if (req.status === 200) {
				setSubmitted(true);
				showNotification({ title: "User deleted", message: message + ". Redirecting...", disallowClose: true });

				setTimeout(() => router.push("../user"), 1500);
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
		setPassword("");
		setPasswordConfirm("");
		if (!props.userData) {
			forms.reset();
			setGroup([]);
		} else {
			forms.setValues({
				username: props.userData.username,
				first_name: props.userData.first_name,
				last_name: props.userData.last_name,
				email: props.userData.email,
				role: props.userData.role,
			});
			setGroup(props.userData.group ? props.userData.group.map((group) => group._id) : []);
		}
	};

	const submitForm = async () => {
		setLoading(true);
		setUnsavedChanges(false);
		if (submitted) return;
		const { username, first_name, last_name, email, role } = forms.values;

		try {
			if (!props.userData) {
				if (password !== passwordConfirm) throw new Error("Passwords do not match");

				const validatePass = validatePassword(password);
				if (!validatePass.success) throw new Error(validatePass.message);
			}

			const req = await fetch(`${SERVER_V1}/${props.userData ? "user/" + props.userData!._id : "user"}`, {
				method: props.userData ? "PUT" : "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username,
					first_name,
					last_name,
					email,
					role,
					group,
					password,
				}),
			});
			const { message } = await req.json();

			if (req.status === 201 || req.status === 200) {
				setSubmitted(true);
				showNotification({ title: "Success", message: message + ". Redirecting...", disallowClose: true });

				setTimeout(() => router.push("../user"), 1500);
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

	const fetchGroups = async () => {
		showNotification({ title: "Loading groups", message: "Please wait...", disallowClose: true, autoClose: 1000 });
		try {
			const req = await fetch(`${SERVER_V1}/group`, {
				method: "GET",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			});
			const { message, data }: GroupQRes = await req.json();

			if (req.status === 200) {
				setGroupsListData((prev) => {
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
			fetchGroups();
			if (props.userData) {
				// edit mode
				forms.setValues({
					username: props.userData.username,
					first_name: props.userData.first_name,
					last_name: props.userData.last_name,
					email: props.userData.email,
					group: props.userData.group,
					role: props.userData.role,
				});
				setGroup(props.userData.group ? props.userData.group.map((group) => group._id) : []);
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
			<TitleDashboard title={props.userData ? "View/Edit User" : "Add User"} hrefLink="../user" hrefText="Back to users" HrefIcon={IconArrowLeft} />

			<Box component="div" sx={{ position: "relative" }}>
				<LoadingOverlay visible={loading} overlayBlur={3} />
				<form onSubmit={forms.onSubmit(handleSubmit)} autoComplete="off">
					<TextInput
						mt="md"
						required
						label="Username"
						placeholder="Username"
						{...forms.getInputProps("username")}
						description={`Username. Characters allowed are alpha numeric, underscore, and hyphen regex`}
						disabled={!editable}
						autoComplete="false"
					/>

					<TextInput required mt="md" label="First Name" description=" " placeholder="First Name" {...forms.getInputProps("first_name")} disabled={!editable} />

					<TextInput required mt="md" label="Last Name" description=" " placeholder="Last Name" {...forms.getInputProps("last_name")} disabled={!editable} />

					<TextInput required mt="md" label="Email" description=" " placeholder="Email" {...forms.getInputProps("email")} disabled={!editable} />

					<MultiSelect
						mt="md"
						data={groupsListData}
						description=" "
						placeholder="Group"
						// {...forms.getInputProps("group")}
						value={group}
						onChange={(value) => {
							if (value.includes("reload")) {
								fetchGroups();
							} else {
								setGroup(value);
							}
						}}
						label="Group"
						disabled={!editable}
						creatable
						searchable
						getCreateLabel={(q) => `+ Create ${q} (open from group page)`}
						onCreate={(q) => {
							window.open(`../group/create?name=${q}`, "_blank");
							return "";
						}}
						maxDropdownHeight={160}
					/>

					<MultiSelect
						required
						mt="md"
						data={userRoleData}
						label="Role"
						placeholder="Role"
						{...forms.getInputProps("role")}
						description={`User's role or permission level`}
						disabled={!editable}
					/>

					{!props.userData ? (
						<>
							<PasswordInput
								required
								mt="md"
								label="Password"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={!editable}
								minLength={8}
								maxLength={250}
								description="Password must be at least 8 characters and include at least one lowercase letter, one uppercase letter, number and one special character (@$!%*?&._-)"
								error={password !== passwordConfirm ? "Passwords do not match" : password.length && !validatePassword(password).success ? validatePassword(password).message : ""}
								autoComplete="false"
							/>
							<PasswordInput
								required
								mt="md"
								label="Password Confirmation"
								placeholder="Password Confirmation"
								description=" "
								value={passwordConfirm}
								onChange={(e) => setPasswordConfirm(e.target.value)}
								disabled={!editable}
								minLength={8}
								maxLength={250}
								error={password !== passwordConfirm ? "Passwords do not match" : password.length && !validatePassword(password).success ? validatePassword(password).message : ""}
								autoComplete="false"
							/>
						</>
					) : null}

					<Group>
						<Group position="right" mt="md" ml="auto">
							{props.userData ? (
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
