import { useState, useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { IconArrowLeft, IconAlertCircle } from "@tabler/icons";
import { TextInput, PasswordInput, Center, Anchor, Paper, Container, Group, Button, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { SERVER_LOCAL_V1 } from "../../utils/constants";

export const Login: NextPage = (props) => {
	const [alertShown, setAlertShown] = useState<Boolean>(false);
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
		const { username, password } = form.values;
		// fetch local api server to get around CORS
		try {
			const loginFetch = await fetch(`${SERVER_LOCAL_V1}/auth/login`, {
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
				showNotification({
					title: "Success",
					message: "You have logged in successfully. Redirecting...",
					disallowClose: true,
					autoClose: 3000,
				});

				setTimeout(() => {
					router.push("/admin");
				}, 3000);
			} else {
				const { message } = await loginFetch.json();

				showNotification({
					title: "Error",
					message,
					disallowClose: false,
					autoClose: 3000,
					color: "red",
				});
			}
		} catch (error: any) {
			showNotification({
				title: "Error",
				message: error.message,
				autoClose: 3000,
				color: "red",
			});
		}
	};

	useEffect(() => {
		// check query params
		if (router.query.loggedout === "true") setAlertShown(true);
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

				<Paper withBorder shadow="md" p={30} mt={20} radius="md">
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
