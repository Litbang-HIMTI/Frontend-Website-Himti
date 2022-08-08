import type { NextPage } from "next";
import Link from "next/link";

export const Header: NextPage = (props) => {
	return (
		<header>
			<hr className="top-hr" />
			<div className="top-header">
				<h1>HIMTI UIN Jakarta</h1>
				<div className="header-icon">
					<Link href="/">
						<a>
							<picture>
								<img className="logo" src="/assets/img/logo-himti.png" alt="logo-himti" />
							</picture>
						</a>
					</Link>
					<Link href="#">
						<a>
							<picture>
								<img className="menu" src="/assets/icons/menu.svg" alt="menu" />
							</picture>
						</a>
					</Link>
				</div>
			</div>
			<div className="header-departemen">
				<Link href="#">
					<a>BPH</a>
				</Link>
				<Link href="#">
					<a>
						Departemen
						<br />
						Kemahasiswaan
					</a>
				</Link>
				<Link href="#">
					<a>
						Departemen
						<br />
						Keprofesian
					</a>
				</Link>
				<Link href="#">
					<a>
						Departemen
						<br />
						Internal
					</a>
				</Link>
				<a href="#">
					Departemen
					<br />
					Eksternal
				</a>
			</div>
			<hr className="bottom-hr" />
		</header>
	);
};
