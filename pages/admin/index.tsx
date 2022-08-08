import { GetServerSideProps, NextPage } from "next";
import { SERVER_V1 } from "../../src/utils/constants";

const dashboardHome: NextPage = (props) => {
	return <h1 {...props}>Test</h1>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	return {
		props: {},
	};
};

export default dashboardHome;
