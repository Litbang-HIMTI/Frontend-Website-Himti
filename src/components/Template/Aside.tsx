import { useMantineColorScheme } from "@mantine/core";
import { useToggleNavbar } from "@context/Navigation.context";
import type { NextPage } from "next";
import Link from "next/link";

const Aside: NextPage = () => {
	const { colorScheme } = useMantineColorScheme();
	const { isOpen } = useToggleNavbar();

	return (
		<>
			<aside className={`${isOpen ? "open-slider" : ""} ${colorScheme === "dark" ? "dark" : "light"}`} id="aside">
				<ul className="bottom-0 d-flex flex-column gap-3 mb-0 ps-0 mx-5 mx-lg-0">
					<li>
						<Link href="/src/pages/Home/index.html">
							<a className="aside__link ">
								<span>Home</span>
							</a>
						</Link>
					</li>
					<li>
						<Link href="/src/pages/Profile/profile.html">
							<a className="aside__link">
								<span>Profile</span>
							</a>
						</Link>
					</li>
					<li>
						<Link href="/src/pages/Information/information.html">
							<a className="aside__link">
								<span>Information</span>
							</a>
						</Link>
					</li>
					<li>
						<Link href="/src/pages/Sevice/service.html">
							<a className="aside__link">
								<span>Service</span>
							</a>
						</Link>
					</li>
					<li>
						<Link href="/src/pages/Forum/forum.html">
							<a className="aside__link">
								<span> Forum </span>
							</a>
						</Link>
					</li>
					<li>
						<Link href="/src/pages/Blog/blog.html">
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
