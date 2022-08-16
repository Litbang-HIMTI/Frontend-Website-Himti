import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { AppShell } from "@mantine/core";
import { NoteForm } from "../../../src/components/Admin/Note";
import { DashboardNav } from "../../../src/components/Admin/Nav";
import { IDashboardProps } from "../../../src/interfaces/props/Dashboard";
import { SERVER_V1, validateStaff } from "../../../src/helper";

const add: NextPage<IDashboardProps> = (props) => {
	return (
		<>
			<Head>
				<meta charSet="UTF-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Note Create | Himti UIN Jakarta</title>
			</Head>
			<AppShell header={<DashboardNav {...props} />}>
				<main className="dashboard content-wrap">
					<NoteForm {...props} />
				</main>
			</AppShell>
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	const checkLoggedIn = await fetch(`${SERVER_V1}/auth`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Cookie: "connect.sid=" + context.req.cookies["connect.sid"],
		},
		credentials: "include",
	});

	// 404 if not logged in
	if (checkLoggedIn.status !== 200) return { notFound: true };

	// validate role
	const parsed = await checkLoggedIn.json();
	if (!validateStaff(parsed.data)) return { notFound: true };

	// get note data
	const fetchNote = await fetch(`${SERVER_V1}/note/${context.params!._id}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Cookie: "connect.sid=" + context.req.cookies["connect.sid"],
		},
		credentials: "include",
	});

	if (fetchNote.status !== 200) return { notFound: true };
	const { data } = await fetchNote.json();

	return {
		props: {
			pathname: context.resolvedUrl,
			user: parsed.data,
			token: context.req.cookies["connect.sid"],
			note: data,
		},
	};
};

export default add;