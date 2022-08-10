import type { GetServerSideProps, NextPage } from "next";
import { Blog } from "../../src/components/Admin/Blog";
import { DashboardNav } from "../../src/components/Admin/Nav/DashboardNav";
import { SERVER_V1 } from "../../src/utils/constants";

const blog: NextPage = (props) => {
	return (
		<main className="dashboard nav-wrap">
			<DashboardNav {...props} />
			<div className="dashboard content-wrap">
				<Blog {...props} />
			</div>
		</main>
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

	return {
		props: {
			pathname: context.resolvedUrl,
		},
	};
};

export default blog;
