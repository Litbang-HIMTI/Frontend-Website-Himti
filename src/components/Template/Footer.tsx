import { NextPage } from "next/types";
import { useMantineColorScheme } from "@mantine/core";

const Footer: NextPage = () => {
	const { colorScheme } = useMantineColorScheme();

	return (
		<footer id="footer" className="border_top thick">
			<div className="container">
				<div className="row gy-5 gx-4 justify-content-around">
					<div className="col-12 col-lg-6">
						<div className="d-flex justify-content-center justify-content-lg-start justify-content-ld-start align-items-center gap-3">
							<img tabIndex={0} className="img_40" src="../../assets/icons/icon-logo.svg" alt="logo himti" />
							<p tabIndex={0} className="fs-2 fw-bold mb-0">
								Himti UIN Jakarta
							</p>
						</div>

						<p tabIndex={0} className={`${colorScheme === "dark" ? "text_gray" : "text_dark_gray"} text_12 footer__organization text-center text-lg-start mx-auto mx-lg-0 mt-2 mt-lg-3`}>
							HIMTI UIN Syarif Hidayatullah Jakarta berfungsi sebagai penyelenggara kegiatan untuk kemahasiswaan, penalaran, dan keilmuan di bidang teknologi informasi.
						</p>
					</div>
					<div className="col-12 col-sm-2">
						<p className="fs-4 fw-bold">About</p>
						<ul className="d-flex gap-2 flex-column p-0">
							<li>
								<a className={`${colorScheme === "dark" ? "text_gray" : "text_dark_gray"}`} href="#profile">
									Profile
								</a>
							</li>
							<li>
								<a className={`${colorScheme === "dark" ? "text_gray" : "text_dark_gray"}`} href="#profile">
									Dev Team
								</a>
							</li>
							<li>
								<a className={`${colorScheme === "dark" ? "text_gray" : "text_dark_gray"}`} href="#profile">
									Documentation
								</a>
							</li>
							<li>
								<a className={`${colorScheme === "dark" ? "text_gray" : "text_dark_gray"}`} href="#profile">
									Forums
								</a>
							</li>
						</ul>
					</div>
					<div className="col-12 col-sm-2">
						<p className="fs-4 fw-bold">Project</p>
						<ul className="d-flex gap-2 flex-column p-0">
							<li>
								<a className={`${colorScheme === "dark" ? "text_gray" : "text_dark_gray"} `} href="#profile">
									Bank Data
								</a>
							</li>
							<li>
								<a className={`${colorScheme === "dark" ? "text_gray" : "text_dark_gray"} `} href="#profile">
									Url Shortener
								</a>
							</li>
							<li>
								<a className={`${colorScheme === "dark" ? "text_gray" : "text_dark_gray"} `} href="#profile">
									Changelog
								</a>
							</li>
							<li>
								<a className={`${colorScheme === "dark" ? "text_gray" : "text_dark_gray"} `} href="#profile">
									Realeases
								</a>
							</li>
						</ul>
					</div>
					<div className="col-12 col-sm-2">
						<p className="fs-4 fw-bold">Community</p>
						<ul className="d-flex gap-2 flex-column p-0">
							<li>
								<a className={`${colorScheme === "dark" ? "text_gray" : "text_dark_gray"}`} href="#profile">
									Join Discord
								</a>
							</li>
							<li>
								<a className={`${colorScheme === "dark" ? "text_gray" : "text_dark_gray"} `} href="#profile">
									Follow on Twitter
								</a>
							</li>
							<li>
								<a className={`${colorScheme === "dark" ? "text_gray" : "text_dark_gray"} `} href="#profile">
									Email newsletter
								</a>
							</li>
							<li>
								<a className={`${colorScheme === "dark" ? "text_gray" : "text_dark_gray"} `} href="#profile">
									Github discussions
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>

			<div className="credit border_top border_gray thin py-4">
				<div className="container">
					<div className="d-flex justify-content-between align-items-center">
						<p tabIndex={0} className="text_gray fs-5">
							2022 Himti UINJakarta
						</p>
						<ul className="credit__media d-flex gap-4">
							<li>
								<a tabIndex={0} target="_blank" rel="noopener noreferrer" href="#">
									<img src="/assets/icons/socialMedia/icon-intagram.svg" alt="instagram" />
								</a>
							</li>
							<li>
								<a target="_blank" rel="noopener noreferrer" href="#">
									<img src="/assets/icons/socialMedia/icon-youtube.svg" alt="youtube" />
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
