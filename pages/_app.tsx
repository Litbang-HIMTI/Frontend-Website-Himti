import "../styles/globals.css";
import "../styles/dashboard.css";
import "../styles/markdown.css";
import { AppProps } from "next/app";
import { MantineProvider, ColorScheme, ColorSchemeProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { RouterTransition } from "../src/components/Utils/Looks/RouterTransition";
import { ModalsProvider } from "@mantine/modals";
import { useLocalStorage } from "@mantine/hooks";

export default function App(props: AppProps & { colorScheme: ColorScheme }) {
	const { Component, pageProps } = props;
	const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({ key: "mantine-color-scheme", defaultValue: "dark" });

	const toggleColorScheme = (value?: ColorScheme) => {
		const nextColorScheme = value || (colorScheme === "dark" ? "light" : "dark");
		setColorScheme(nextColorScheme);
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
					<ModalsProvider>
						<NotificationsProvider position="top-right">
							<RouterTransition />
							<Component {...pageProps} />
						</NotificationsProvider>
					</ModalsProvider>
				</MantineProvider>
			</ColorSchemeProvider>
		</>
	);
}
