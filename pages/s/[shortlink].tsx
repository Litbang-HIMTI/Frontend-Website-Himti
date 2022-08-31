import { GetServerSideProps, NextPage } from "next";
import axios from "axios";
import Head from "next/head";
import { IShortlink } from "../../src/interfaces/db/Shortlink";
import { SERVER_V1 } from "../../src/helper/global/constants";
import extractSiteMetadata, { PageData } from "extract-site-metadata";

const indexShortlink: NextPage<PageData> = (props) => {
	return (
		<>
			<Head>
				<meta charSet="UTF-8" />
				<title>{props.title}</title>
				<meta name="title" content={props.title} />
				<meta name="description" content={props.description} />
				<meta name="keywords" content={props.keywords} />
				<meta name="author" content={props.author as any} />
				<link rel="icon" href={props.favicon} />

				<meta property="og:type" content={props.type} />
				<meta property="og:url" content={props.origin} />
				<meta property="og:title" content={props.title} />
				<meta property="og:description" content={props.description} />
				<meta property="og:image" content={props.image} />
				<meta property="og:site_name" content={props.siteName} />
				<meta property="article:published_time" content={props.date} />

				<meta property="twitter:card" content="summary_large_image" />
				<meta property="twitter:url" content={props.origin} />
				<meta property="twitter:title" content={props.title} />
				<meta property="twitter:description" content={props.description} />
				<meta property="twitter:image" content={props.keywords} />
			</Head>
			<p>Redirecting...</p>
		</>
	);
};

const processSite = async (url: string) => {
	return axios
		.get(url)
		.then((res) => {
			const { headers } = res;
			const contentType = headers["content-type"];
			if (contentType.includes("text/html")) {
				return {
					body: res.data,
					url,
				};
			}
		})
		.catch((err) => {
			console.log(err);
		});
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { shortlink } = context.params!;
	if (!shortlink || shortlink === "") return { notFound: true };

	// TODO: shortlink berdasarkan rumus algoritma
	const checkShortLink = await fetch(`${SERVER_V1}/shortlink/${shortlink}?updateClick=1`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (checkShortLink.status !== 200) return { notFound: true };

	const shortlinkData = await checkShortLink.json();
	const { data }: { data: IShortlink } = shortlinkData;

	try {
		const siteData = await processSite(data.url);
		const siteMetadata = extractSiteMetadata(siteData?.body, data.url);

		// TODO: CEK METADATANYA KALO DAH DI DEPLOY
		return {
			redirect: {
				permanent: false,
				destination: data.url,
			},
			props: siteMetadata,
		};
	} catch (error) {
		return { notFound: true };
	}
};

export default indexShortlink;
