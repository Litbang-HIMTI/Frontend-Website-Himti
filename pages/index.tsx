import type { GetServerSideProps, NextPage } from "next";
import { Home } from "@components/Home/Home";
import Layout from "@components/Template/Layout";

const index: NextPage = (props) => {
	return <Home />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	return {
		props: {
			test: "test",
		},
	};
};

export default index;
