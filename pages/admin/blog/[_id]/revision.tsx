import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { AppShell } from "@mantine/core";
import { BlogForm, BlogRevision } from "../../../../src/components/Admin/Blog";
import { DashboardNav } from "../../../../src/components/Admin/Nav";
import { IDashboardProps } from "../../../../src/interfaces/props/Dashboard";
import { SERVER_V1, validateEditor } from "../../../../src/helper";

const post_revision: NextPage<IDashboardProps> = (props) => {
	return (
		<>
			<Head>
				<meta charSet="UTF-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>View Post Reivsion | Himti UIN Jakarta</title>
			</Head>
			<AppShell header={<DashboardNav {...props} />}>
				<main className="dashboard content-wrap">
					<BlogRevision {...props} />
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
	if (!validateEditor(parsed.data)) return { notFound: true };

	// get blog data
	const fetchBlog = await fetch(`${SERVER_V1}/blog/${context.params!._id}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Cookie: "connect.sid=" + context.req.cookies["connect.sid"],
		},
		credentials: "include",
	});

	if (fetchBlog.status !== 200) return { notFound: true };
	const blogJson = await fetchBlog.json();

	// get blog revision data
	const fetchBlogRevision = await fetch(`${SERVER_V1}/blog/${context.params!._id}/revision`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Cookie: "connect.sid=" + context.req.cookies["connect.sid"],
		},
		credentials: "include",
	});

	const blogRevisionJson = await fetchBlogRevision.json();

	return {
		props: {
			pathname: context.resolvedUrl,
			user: parsed.data,
			token: context.req.cookies["connect.sid"],
			blog: blogJson.data,
			blogRevision: blogRevisionJson.data,
		},
	};
};

export default post_revision;
