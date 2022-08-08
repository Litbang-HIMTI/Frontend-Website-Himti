import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { TextInput, PasswordInput, Center, Anchor, Paper, Container, Group, Button } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons";

export const Login: NextPage = (props) => {
	return (
		<>
			<Head>
				<meta charSet="UTF-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Dashboard Login - Himti UIN Jakarta</title>
			</Head>

			<Container size={420} my={40}>
				<Center>
					<picture>
						<img className="dashboard login-logo" src="/assets/img/logo-himti.png" alt="logo-himti" />
					</picture>
				</Center>

				<Paper withBorder shadow="md" p={30} mt={30} radius="md">
					<TextInput label="Username or Email address" placeholder="Johnsmith2000" required />
					<PasswordInput label="Password" placeholder="Your password" required mt="md" />
					<Group position="apart" mt="md">
						<Link href="/">
							<Anchor<"a"> size="sm">
								<IconArrowLeft size={12} stroke={1.5} />
								<span style={{ marginLeft: "5px" }}>Back to home</span>
							</Anchor>
						</Link>
					</Group>
					<Button fullWidth mt="xl">
						Sign in
					</Button>
				</Paper>
			</Container>
		</>
	);
};
