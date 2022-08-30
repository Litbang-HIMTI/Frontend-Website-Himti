import { useState, useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { IconArrowLeft, IconAlertCircle, IconX, IconCheck } from "@tabler/icons";
import { TextInput, PasswordInput, Center, Anchor, Paper, Container, Group, Button, Alert, LoadingOverlay } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification, updateNotification } from "@mantine/notifications";
import { SERVER_V1 } from "../../helper/global/constants";

interface loginProps {
	query?: any;
}

export const Login: NextPage<loginProps> = (props) => {
	const [alertShown, setAlertShown] = useState<boolean>(false);
	const [submitted, setSubmitted] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const router = useRouter();
	const form = useForm({
		initialValues: {
			username: "",
			password: "",
		},

		validate: {
			username: (value) => {
				if (!value) return "Username is required";
			},
			password: (value) => {
				if (!value) return "Password is required";
			},
		},
	});

	const submitForm = async () => {
		setLoading(true);
		if (submitted) return;
		const { username, password } = form.values;
		showNotification({ id: "login-notif", title: "Loading", message: "Logging in...", loading: true, disallowClose: true, autoClose: false });
		try {
			const loginFetch = await fetch(`${SERVER_V1}/auth`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username,
					password,
				}),
			});

			if (loginFetch.status === 200) {
				setSubmitted(true);
				updateNotification({
					id: "login-notif",
					title: "Success",
					message: "You have logged in successfully. Redirecting...",
					loading: false,
					autoClose: 2000,
					icon: <IconCheck size={16} />,
				});

				setTimeout(() => {
					router.push("/admin");
				}, 1000);
			} else {
				setLoading(false);
				const { message } = await loginFetch.json();

				updateNotification({ id: "login-notif", title: "Error", message, loading: false, disallowClose: false, autoClose: 4000, color: "red", icon: <IconX size={16} /> });
			}
		} catch (error: any) {
			setLoading(false);
			updateNotification({ id: "login-notif", title: "Error", message: error.message, loading: false, disallowClose: false, autoClose: 4000, color: "red", icon: <IconX size={16} /> });
		}
	};

	useEffect(() => {
		// check query params
		if (props.query.loggedout === "true") setAlertShown(true);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<Head>
				<meta charSet="UTF-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Dashboard Login - Himti UIN Jakarta</title>
			</Head>

			<Container size={420} my={40}>
				<Center sx={{ display: "flex", flexDirection: "column" }}>
					<picture>
						<img className="dashboard login-logo" src="/assets/img/logo-himti.png" alt="logo-himti" />
					</picture>

					{alertShown && (
						<Alert
							mt="1rem"
							icon={<IconAlertCircle size={16} />}
							title="Logged out!"
							withCloseButton
							closeButtonLabel="Close alert"
							variant="outline"
							onClose={() => {
								setAlertShown((prev) => !prev);
								router.replace("/auth/login");
							}}
						>
							You have been logged out successfully
						</Alert>
					)}
				</Center>

				<Paper withBorder shadow="md" p={30} mt={20} radius="md" sx={{ position: "relative" }}>
					<LoadingOverlay visible={loading} overlayBlur={2} />
					<form onSubmit={form.onSubmit(submitForm)}>
						<TextInput label="Username or Email address" placeholder="Johnsmith2000" required {...form.getInputProps("username")} />
						<PasswordInput label="Password" placeholder="Your password" required mt="md" {...form.getInputProps("password")} />
						<Group position="apart" mt="md">
							<Link href="/">
								<Anchor<"a"> size="sm">
									<IconArrowLeft size={12} stroke={1.5} />
									<span style={{ marginLeft: "5px" }}>Back to home</span>
								</Anchor>
							</Link>
						</Group>
						<Button fullWidth mt="xl" type="submit">
							Sign in
						</Button>
					</form>
				</Paper>
			</Container>
		</>
	);
};
