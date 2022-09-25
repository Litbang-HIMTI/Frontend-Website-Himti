import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { IBlog } from "@interfaces/db";
import Head from "next/head";
import styles from "./Home.module.css";
import Information from "./Information/Information";
import Blog from "./Blog/Blog";
import Gallery from "./Gallery/Gallery";

export const Home: NextPage = () => {
	const [blogs, setBlogs] = useState<IBlog[] | null>(null);

	const fetchBlogs = (controller: AbortController) => {
		fetch("http://localhost:42069/v1/blog", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			signal: controller.signal,
		})
			.then((res) => res.json())
			.then((data) => {
				setBlogs(data?.data);
			})
			.catch((err) => {
				if (err.name === "AbortError") {
					console.log("Aborted");
				} else {
					console.log(err);
				}
			});
	};

	useEffect(() => {
		const controller = new AbortController();
		fetchBlogs(controller);
		return () => {
			controller.abort();
		};
	}, []);

	return (
		<>
			<Head>
				<meta charSet="UTF-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Himti UIN Jakarta</title>
			</Head>

			{/* <Link href="/auth/login">
				<a>login </a>
			</Link> */}

			<div id="main__container">
				{/* <!-- Tagline --> */}
				<section id="jumbotron" className="container">
					<div className={styles.jumbotron__content}>
						<div tabIndex={0} className={styles.tagline}>
							<div className="position-relative">
								<h1 className={styles.jumbotron__title}>Satu Jiwa</h1>
								{/* <!-- <img layout="fill" 
                  className="position-absolute"
                  src="/assets/icons/icon-speaker.svg"
                  alt="speaker"
                /> --> */}
							</div>
							<h1 className={styles.jumbotron__title}>Satu Nyawa</h1>
							<h1 className={`${styles.text__green} ${styles.jumbotron__title}`}>Informatika!</h1>
						</div>
						<p tabIndex={0} className="align-self-end ms-auto ms-md-0 fw-semibold mb-4">
							HIMTI UIN Syarif Hidayatullah Jakarta berfungsi sebagai penyelenggara kegiatan untuk kemahasiswaan, penalaran, dan keilmuan di bidang teknologi informasi.
						</p>
					</div>
				</section>

				{/* <!-- Important Information --> */}
				<Information />

				{/* <!-- Blog --> */}
				<Blog dataBlogs={blogs} />

				{/* <!-- Gallery --> */}
				<Gallery />

				{/* <!-- Short About Us --> */}
				<section id="short-about" className="container">
					<div className={`${styles.content} border_top thick`}>
						<p tabIndex={0} className="mt-3 mt-md-4 fs-title text-center">
							Apa itu HIMTI UIN Jakarta?
						</p>
						<div className="mt-4 mt-md-5">
							<p tabIndex={0} className="text-center fs-text">
								<span className="fs-title">HIMTI UIN Syarif Hidayatullah Jakarta </span>merupakan wadah silaturahmi dan pemersatu antar Mahasiswa dengan Alumni Program Studi Teknik
								Informatika UIN Syarif Hidayatullah Jakarta, serta berfungsi sebagai penyelenggara kegiatan untuk kemahasiswaan, penalaran, dan keilmuan di bidang teknologi informasi.
							</p>
						</div>
					</div>
				</section>

				{/* <!-- Vision and Mission --> */}
				<section id="vision-mission" className="container">
					<div className={styles.content}>
						<p tabIndex={0} className="fs-title text-center">
							Visi dan Misi
						</p>

						<div className="vision-mission__body mt-4 mt-md-5">
							<div className="row row-cols-1 row-cols-md-2 g-5">
								<div className="col fs-text text-center text-md-end">
									<p tabIndex={0} className="fw-bold">
										Visi
									</p>
									<p tabIndex={0}>
										Terwujudnya HIMTI UIN Jakarta yang dinamis dan aktif dalam fungsi internal dan eksternal dengan berlandaskan semangat solidaritas dan profesionalitas dalam menuju
										himpunan yang harmoni.
									</p>
								</div>
								<div className="col fs-text text-center text-md-start">
									<p tabIndex={0} className="fw-bold">
										Misi
									</p>
									<p tabIndex={0}>Meningkatkan peran proaktif Mahasiswa TI dalam aktivitas organisasi, profesi, maupun minat dan bakat.</p>
									<p tabIndex={0}>Menjadikan HIMTI UIN Jakarta sebagai wadah sekunder bagi Mahasiswa TI dalam mengembangkan kemampuan akademis maupun non-akademis.</p>
									<p tabIndex={0}>Mempererat hubungan persaudaraan antar Mahasiswa TI melalui semangat solidaritas dan profesionalitas</p>
								</div>
							</div>
						</div>
					</div>
				</section>
			</div>
		</>
	);
};
