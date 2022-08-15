import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { AppShell } from "@mantine/core";
import { Group } from "../../../src/components/Admin/Group";
import { DashboardNav } from "../../../src/components/Admin/Nav";
import { IDashboardProps } from "../../../src/interfaces/props/Dashboard";
import { SERVER_V1, validateAdmin } from "../../../src/utils";

const group: NextPage<IDashboardProps> = (props) => {
	return (
		<>
			<Head>
				<meta charSet="UTF-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Group Dashboard | Himti UIN Jakarta</title>
			</Head>
			<AppShell header={<DashboardNav {...props} />}>
				<main className="dashboard content-wrap">
					<Group {...props} />
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
	});

	// 404 if not logged in
	if (checkLoggedIn.status !== 200) return { notFound: true };

	// validate role
	const parsed = await checkLoggedIn.json();
	if (!validateAdmin(parsed.data)) return { notFound: true };

	return {
		props: {
			pathname: context.resolvedUrl,
			user: parsed.data,
			token: context.req.cookies["connect.sid"],
		},
	};
};

export default group;
