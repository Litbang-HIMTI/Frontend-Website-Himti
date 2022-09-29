import { NextPage } from "next";
import Head from "next/head";
import DetailBlog from "@components/Blogs/DetailBlog/DetailBlog";

const detail: NextPage = () => {
	return (
		<>
			<Head>
				<meta charSet="UTF-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Blog | Himti UIN Jakarta</title>
			</Head>

			<DetailBlog />
		</>
	);
};

export default detail;
