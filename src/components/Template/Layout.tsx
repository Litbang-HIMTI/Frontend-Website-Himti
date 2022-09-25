import type { NextPage } from "next";
import React, { Component } from "react";
import Header from "./Header";
import Aside from "./Aside";
import Footer from "./Footer";
import { useToggleNavbar } from "@context/Navigation.context";
import { ColorSchemeToggle } from "../Utils/Looks/ColorSchemeToggle";

type LayoutProps = {
	children?: React.ReactNode;
};

const Layout = (props: LayoutProps) => {
	const { closeNavigation } = useToggleNavbar();

	return (
		<>
			<Header />
			<main onClick={closeNavigation}>
				<Aside />

				{props.children}

				<ColorSchemeToggle />
			</main>
			<Footer />
		</>
	);
};

export default Layout;
