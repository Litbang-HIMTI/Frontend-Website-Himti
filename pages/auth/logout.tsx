import { GetServerSideProps, NextPage } from "next";
import { SERVER_V1 } from "../../src/helper/global/constants";

const indexShortlink: NextPage = (props) => {
	return <p>Logging out...</p>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	const checkLogOut = await fetch(`${SERVER_V1}/auth`, {
		method: "DELETE",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			Cookie: "connect.sid=" + context.req.cookies["connect.sid"],
		},
	});

	if (checkLogOut.status !== 200) return { notFound: true };
	else {
		// remove cookie
		context.res.setHeader("Set-Cookie", "connect.sid=; Path=/; Expires=Thu, 01 Jan 1984 00:00:00 GMT;");

		return {
			redirect: {
				permanent: false,
				destination: "/auth/login?loggedout=true",
			},
			props: {},
		};
	}
};

export default indexShortlink;
