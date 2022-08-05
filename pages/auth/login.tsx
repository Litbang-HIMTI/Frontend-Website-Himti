import { GetServerSideProps, NextPage } from "next";
import { ___serverV1___ } from "../../src/utils/constants";

const indexLogin: NextPage = (props) => {
	return <h1>Test</h1>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	const checkLoggedIn = await fetch(`${___serverV1___}/auth`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
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
