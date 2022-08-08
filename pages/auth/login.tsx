import { GetServerSideProps, NextPage } from "next";
import { Login } from "../../src/components/admin/Login";
import { SERVER_V1 } from "../../src/utils/constants";

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
		props: {},
	};
};

export default indexLogin;
