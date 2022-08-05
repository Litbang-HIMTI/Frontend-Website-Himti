import { NextPage } from "next";
import Head from "next/head";

const PageNotFound: NextPage = (props) => {
	return (
		<>
			<Head>
				<title>404 - Page Not Found - HIMTI UIN Jakarta</title>
				<meta charSet="UTF-8" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div>404 PAGE NOT FOUND</div>
		</>
	);
};

export default PageNotFound;
