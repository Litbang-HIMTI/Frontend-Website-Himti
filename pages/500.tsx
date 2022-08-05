import { NextPage } from "next";
import Head from "next/head";

const PageNotFound: NextPage = (props) => {
	return (
		<>
			<Head>
				<title>500 - Internal Server Error - HIMTI UIN Jakarta</title>
				<meta charSet="UTF-8" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div>500 - Internal Server Error</div>
		</>
	);
};

export default PageNotFound;
