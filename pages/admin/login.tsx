import { GetServerSideProps, NextPage } from "next";
import { Login } from "../../src/components/admin/Login";

const dashboardHome: NextPage = (props) => {
	return <Login {...props} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	return {
		props: {},
	};
};

export default dashboardHome;
