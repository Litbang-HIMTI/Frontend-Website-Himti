import { GetServerSideProps, NextPage } from "next";
import { server } from "../../src/utils/constants";

const indexLogin: NextPage = (props) => {
	return <h1>Test</h1>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	const checkLoggedIn = await fetch(`${server}/v1/auth`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			// "x-auth-token": context.req.headers.cookie.split("=")[1],
		},
	});

	// redirect to dashboard if logged in
	if (checkLoggedIn.status === 200) context.res.writeHead(302, { Location: "/admin" });

	return {
		props: {},
	};
};

export default indexLogin;
