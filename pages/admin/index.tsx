import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { AdminHome } from "../../src/components/Admin/Home";
import { DashboardNav } from "../../src/components/Admin/Nav/DashboardNav";
import { SERVER_V1 } from "../../src/utils/constants";
import { validateStaff } from "../../src/utils/helper";

const dashboardHome: NextPage = (props) => {
	return (
		<>
			<Head>
				<meta charSet="UTF-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Dashboard | Himti UIN Jakarta</title>
			</Head>
			<main className="dashboard nav-wrap">
				<DashboardNav {...props} />
				<div className="dashboard content-wrap">
					<AdminHome {...props} />
				</div>
			</main>
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
	if (!validateStaff(parsed.data)) return { notFound: true };

	return {
		props: {
			pathname: context.resolvedUrl,
			user: parsed.data,
		},
	};
};

export default dashboardHome;
