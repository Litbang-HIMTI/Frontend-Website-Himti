import type { NextPage } from "next";
import { useRouter } from "next/router";
import { createStyles, Title, Text, Button, Container, Group } from "@mantine/core";

const useStyles = createStyles((theme) => ({
	root: {
		paddingTop: 80,
		paddingBottom: 120,
	},

	label: {
		textAlign: "center",
		fontWeight: 900,
		fontSize: 220,
		lineHeight: 1,
		marginBottom: theme.spacing.xl * 1.5,
		color: theme.colors[theme.primaryColor][3],

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
		maxWidth: 540,
		margin: "auto",
		marginTop: theme.spacing.xl,
		marginBottom: theme.spacing.xl * 1.5,
	},
}));

interface Props {
	statusCode?: string;
}

const Error: NextPage<Props> = ({ statusCode }) => {
	const { classes } = useStyles();
	const router = useRouter();

	const btnClick = () => {
		if (router.query && router.query.back === "true") router.back();
		else router.reload();
	};

	return (
		<div className={classes.root}>
			<Container>
				<div className={classes.label}>{statusCode || 500}</div>
				<Title className={classes.title}>Something bad just happened...</Title>
				<Text size="lg" align="center" className={classes.description}>
					Our servers could not handle your request. It might be down for a moment. Try refreshing the page.
					<Text size="xs" align="center" mt="1rem">
						(Check browser console for more details)
					</Text>
				</Text>
				<Group position="center">
					<Button size="md" onClick={btnClick}>
						Refresh the page
					</Button>
				</Group>
			</Container>
		</div>
	);
};

Error.getInitialProps = async ({ res, err }) => {
	const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
	return { statusCode } as Props;
};

export default Error;
