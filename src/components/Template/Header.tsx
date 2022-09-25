import { useMantineColorScheme } from "@mantine/core";
import { useToggleNavbar } from "@context/Navigation.context";
import type { NextPage } from "next";
import Link from "next/link";

const Header: NextPage = () => {
	const { colorScheme } = useMantineColorScheme();
	const { toggleNavigation } = useToggleNavbar();

	return (
		<>
			<div className={`${colorScheme === "dark" ? "dark" : "light"} divider position-sticky top-0 start-0 end-0`}></div>

			<header>
				<nav className="navigation__container row gx-0">
					<Link href="/">
						<a tabIndex={1} className="link-logo  fs-1 col-8 col-lg-3 d-flex align-items-center pt-3 pt-lg-0">
							HIMTI UIN Jakarta
						</a>
					</Link>

					<ul className="col-12 col-lg-8 order-3 order-lg-2 d-flex justify-content-between align-items-center overflow-scroll gap-4 mb-0 px-3 pb-4 pb-lg-5 pt-3 pt-lg-4">
						<li>
							<Link href="/">
								<a>BPH</a>
							</Link>
						</li>
						<li>
							<Link href="/">
								<a>Departemen Kemahasiswaan</a>
							</Link>
						</li>
						<li>
							<Link href="/">
								<a>Departemen Keprofesian</a>
							</Link>
						</li>
						<li>
							<Link href="/">
								<a>Departemen Interna</a>
							</Link>
						</li>
						<li>
							<Link href="/">
								<a>Departemant External</a>
							</Link>
						</li>
					</ul>

					<div className="navigation__action col-4 col-lg-1 order-2 order-lg-3 d-flex flex-row justify-content-end align-items-center gap-2 gap-sm-3 gap-md-4 pb-0 pb-lg-5 pt-3 pt-lg-4">
						<img tabIndex={0} src="assets/icons/icon-logo.svg" alt="logo" />

						{/* Toggler Navbar  */}
						<div onClick={toggleNavigation} className="navigation__toggler d-flex d-lg-none">
							<span className={`${colorScheme === "dark" ? "light" : "dark"}`}></span>
							<span className={`${colorScheme === "dark" ? "light" : "dark"}`}></span>
							<span className={`${colorScheme === "dark" ? "light" : "dark"}`}></span>
						</div>
					</div>
				</nav>
			</header>
		</>
	);
};

export default Header;
