import { useState } from "react";
import { useMantineColorScheme } from "@mantine/core";
import { useToggleNavbar } from "@context/Navigation.context";
import type { NextPage } from "next";
import Link from "next/link";

const Aside: NextPage = () => {
	const { colorScheme } = useMantineColorScheme();
	const { isOpen } = useToggleNavbar();
	const [dropDown, setDropDown] = useState<boolean>(false);

	return (
		<>
			<aside className={`${isOpen ? "open-slider" : ""} ${colorScheme === "dark" ? "dark" : "light"}`} id="aside">
				<ul className="bottom-0 d-flex flex-column gap-3 mb-0 ps-0 mx-5 mx-lg-0">
					<li>
						<Link href="/">
							<a className="aside__link ">
								<span>Home</span>
							</a>
						</Link>
					</li>
					<li>
						<Link href="/profile">
							<a className="aside__link">
								<span>Profile</span>
							</a>
						</Link>
					</li>
					<li>
						<Link href="/information">
							<a className="aside__link">
								<span>Information</span>
							</a>
						</Link>
					</li>

					<li onClick={() => setDropDown(!dropDown)} className={`dropdown__link position-relative`}>
						<p className="aside__link mb-0 w-100">
							<span>Service </span>
						</p>
						<ul className={`${dropDown ? "d-block" : ""}  dropdown__menu ps-0`}>
							<li className="dropdown__item">
								<a href="#">Bank Data</a>
							</li>
							<li className="dropdown__item">
								<a href="#">URL Shortener </a>
							</li>
						</ul>
					</li>
					<li>
						<Link href="/forum">
							<a className="aside__link">
								<span>Forum</span>
							</a>
						</Link>
					</li>
					<li>
						<Link href="/blogs">
							<a className="aside__link">
								<span>Blog</span>
							</a>
						</Link>
					</li>
				</ul>
			</aside>
		</>
	);
};

export default Aside;
