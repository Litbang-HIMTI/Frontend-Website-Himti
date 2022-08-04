import type { NextPage } from "next";
import Head from "next/head";
import { ColorSchemeToggle } from "../ColorSchemeToggle/ColorSchemeToggle";
import { Header } from "../Template/Header";

export const Home: NextPage = (props) => {
	console.log(props); // test
	return (
		<>
			<Head>
				<meta charSet="UTF-8" />
				<meta http-equiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Himti UIN Jakarta</title>
			</Head>

			<Header />
			<ColorSchemeToggle />
		</>
	);
};
