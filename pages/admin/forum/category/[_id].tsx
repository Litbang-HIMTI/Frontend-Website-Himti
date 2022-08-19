import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { AppShell } from "@mantine/core";
import { ForumCategoryForm } from "../../../../src/components/Admin/Forum";
import { DashboardNav } from "../../../../src/components/Admin/Nav";
import { IDashboardProps } from "../../../../src/interfaces/props/Dashboard";
import { SERVER_V1, validateForumMod } from "../../../../src/helper";

const forum: NextPage<IDashboardProps> = (props) => {
	return (
		<>
			<Head>
				<meta charSet="UTF-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Forum Category View/Edit | Himti UIN Jakarta</title>
			</Head>
			<AppShell header={<DashboardNav {...props} />}>
				<main className="dashboard content-wrap">
					<ForumCategoryForm {...props} />
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
	if (!validateForumMod(parsed.data)) return { notFound: true };

	// get forum category data
	const fetchFC = await fetch(`${SERVER_V1}/forum_category/${context.params!._id}/admin`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Cookie: "connect.sid=" + context.req.cookies["connect.sid"],
		},
		credentials: "include",
	});

	if (fetchFC.status !== 200) return { notFound: true };
	const { data } = await fetchFC.json();

	return {
		props: {
			pathname: context.resolvedUrl,
			user: parsed.data,
			token: context.req.cookies["connect.sid"],
			forum_category: data,
		},
	};
};

export default forum;
