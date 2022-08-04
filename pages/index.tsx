import type { GetServerSideProps, NextPage } from "next";
import { Home } from "../src/components/Home/Home";

const index: NextPage = (props) => {
	return <Home {...props} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	return {
		props: {
			test: "test",
		},
	};
};

export default index;
