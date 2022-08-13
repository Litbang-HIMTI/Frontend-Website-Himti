import "../styles/globals.css";
import "../styles/dashboard.css";
import { GetServerSidePropsContext } from "next";
import { useState } from "react";
import { AppProps } from "next/app";
import { getCookie, setCookie } from "cookies-next";
import { MantineProvider, ColorScheme, ColorSchemeProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { RouterTransition } from "../src/components/Utils/RouterTransition";

export default function App(props: AppProps & { colorScheme: ColorScheme }) {
	const { Component, pageProps } = props;
	const [colorScheme, setColorScheme] = useState<ColorScheme>(props.colorScheme);

	const toggleColorScheme = (value?: ColorScheme) => {
		const nextColorScheme = value || (colorScheme === "dark" ? "light" : "dark");
		setColorScheme(nextColorScheme);
		setCookie("mantine-color-scheme", nextColorScheme, { maxAge: 60 * 60 * 24 * 30, sameSite: true });
	};

	return (
		<>
			<ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
				<MantineProvider
					theme={{
						colorScheme,
						fontFamily: ["Raleway", "sans-serif"],
						lineHeight: "1.2", // default web line height
						colors: {
							dark: ["#FFFFFF", "#A6A7AB", "#909296", "#5C5F66", "#373A40", "#2C2E33", "#25262B", "#000000", "#141517", "#101113"],
						},
					}}
					withGlobalStyles
					withNormalizeCSS
				>
					<NotificationsProvider>
						<RouterTransition />
						<Component {...pageProps} />
					</NotificationsProvider>
				</MantineProvider>
			</ColorSchemeProvider>
		</>
	);
}

App.getInitialProps = ({ ctx }: { ctx: GetServerSidePropsContext }) => ({
	colorScheme: getCookie("mantine-color-scheme", ctx) || "light",
});
