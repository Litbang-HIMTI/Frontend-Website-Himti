import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { createStyles, Title, Text, Button, Container, Group } from "@mantine/core";
import { useRouter } from "next/router";

const useStyles = createStyles((theme) => ({
	root: {
		paddingTop: 80,
		paddingBottom: 80,
	},

	label: {
		textAlign: "center",
		fontWeight: 900,
		fontSize: 220,
		lineHeight: 1,
		marginBottom: theme.spacing.xl * 1.5,
		color: theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2],

		[theme.fn.smallerThan("sm")]: {
			fontSize: 120,
		},
	},

	title: {
		fontFamily: `Greycliff CF, ${theme.fontFamily}`,
		textAlign: "center",
		fontWeight: 900,
		fontSize: 38,

		[theme.fn.smallerThan("sm")]: {
			fontSize: 32,
		},
	},

	description: {
		maxWidth: 500,
		margin: "auto",
		marginTop: theme.spacing.xl,
		marginBottom: theme.spacing.xl * 1.5,
	},
}));

const PageNotFound: NextPage = (props) => {
	const { classes } = useStyles();
	const router = useRouter();

	return (
		<>
			<Head>
				<title>404 - Page Not Found - HIMTI UIN Jakarta</title>
				<meta charSet="UTF-8" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Container className={classes.root}>
				<div className={classes.label}>404</div>
				<Title className={classes.title}>Page Not Found.</Title>
				<Text color="dimmed" size="lg" align="center" className={classes.description}>
					You may have mistyped the address, or the page has been moved to another URL.
				</Text>
				<Group position="center">
					<Button size="md" color="green" onClick={() => router.back()}>
						Go back
					</Button>
					<Link href="/">
						<Button size="md">Take me to home page</Button>
					</Link>
				</Group>
			</Container>
		</>
	);
};

export default PageNotFound;
