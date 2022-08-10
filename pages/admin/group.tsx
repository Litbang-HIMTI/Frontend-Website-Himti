import type { GetServerSideProps, NextPage } from "next";
import { Group } from "../../src/components/Admin/Group";
import { DashboardNav } from "../../src/components/Admin/Nav/DashboardNav";
import { SERVER_V1 } from "../../src/utils/constants";

const group: NextPage = (props) => {
	return (
		<main className="dashboard nav-wrap">
			<DashboardNav {...props} />
			<div className="dashboard content-wrap">
				<Group {...props} />
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

export default group;
