import { GetServerSideProps, NextPage } from "next";
import { Login } from "../../src/components/Auth/Login";
import { SERVER_V1 } from "../../src/helper/global/constants";

const indexLogin: NextPage = (props) => {
	return <Login {...props} />;
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

	// redirect to dashboard if logged in
	if (checkLoggedIn.status === 200)
		return {
			redirect: {
				permanent: false,
				destination: "/admin",
			},
			props: {},
		};

	return {
		props: {
			query: context.query,
		},
	};
};

export default indexLogin;
