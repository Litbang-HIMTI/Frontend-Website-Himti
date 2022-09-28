import { useMantineColorScheme } from "@mantine/core";
import { useToggleNavbar } from "@context/Navigation.context";
import type { NextPage } from "next";
import Link from "next/link";

const AsideIcon: NextPage = () => {
	const { colorScheme } = useMantineColorScheme();
	const { isOpen } = useToggleNavbar();

	return (
		<>
			<aside className="aside_icon">
				<ul className="bottom-0 d-flex justify-content-between align-items-start gap-5 ps-0 mx-3 mx-lg-0 ms-lg-auto">
					<li>
						<a href="/src/pages/Home/index.html">
							<img src="/assets/icons/slider/icon-home.svg" alt="home" />
						</a>
					</li>
					<li>
						<a href="/src/pages/Profile/profile.html">
							<img src="/assets/icons/slider/icon-cell.svg" alt="cell" />
						</a>
					</li>
					<li>
						<a href="/src/pages/Information/information.html">
							<img src="/assets/icons/slider/icon-newspaper.svg" alt="newspaper" />
						</a>
					</li>
					<li>
						<a href="/src/pages/Sevice/service.html">
							<img src="/assets/icons/slider/icon-bag.svg" alt="bag" />
						</a>
					</li>
					<li>
						<a href="/src/pages/Forum/forum.html">
							<img src="/assets/icons/slider/icon-megaphone.svg" alt="megaphone" />
						</a>
					</li>
				</ul>
			</aside>
		</>
	);
};

export default AsideIcon;
