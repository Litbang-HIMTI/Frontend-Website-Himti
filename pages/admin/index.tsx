import { GetServerSideProps, NextPage } from "next";

const dashboardHome: NextPage = (props) => {
	return <h1 {...props}>Test</h1>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	return {
		props: {},
	};
};

export default dashboardHome;