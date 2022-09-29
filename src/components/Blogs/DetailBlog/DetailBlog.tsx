import { NextPage } from "next";
import { Textarea, TextInput } from "@mantine/core";
import { useMantineColorScheme } from "@mantine/core";
import styles from "./DetailBlog.module.css";

const DetailBlog: NextPage = () => {
	const { colorScheme } = useMantineColorScheme();

	return (
		<>
			<div id="main__container">
				<div className="row justify-content-between g-5 g-lg-0 h-100 mx-0">
					<div className={`${styles.blog__content} col-12 col-lg-8`}>
						<div className="blog__content-creator d-flex flex-row align-items-center gap-3">
							<a href="#">
								<img className="creator__image" src="/assets/icons/icon-logoKominfo.svg" alt="Kominfo Logo" />
							</a>
							<div className="d-flex flex-column">
								<a href="#" className={`${colorScheme === "dark" ? "fc-white" : "text_dark_gray"} text-decoration-none fw-semibold link fs-5 mb-0`}>
									Divisi Komunikasi dan Informasi
								</a>
								<p className="fw-light mb-0">
									27 Agustus 2022<strong className="fw-bold fs-4 mx-3">.</strong>14.38
								</p>
							</div>
						</div>

						<div className="blog__content-desc mt-5">
							<p className="fs-2 fw-bold">Apa Itu HTTP? – Mengenal Pengertian, Fungsi, dan Cara Kerja HTTP</p>

							<img className="my-5 w-100 img-fluid" src="/assets/thumbs/thumb-bolgDetail.png" alt="featured image" />

							<p className="fs-text">
								HTTP atau yang dapat disebut Hypertext Transfer Protocol adalah protokol yang mengantarkan sebuah data dari web server ke browser, dengan kata lain HTTP bertugas untuk
								menjalankan proses yang dilaksanakan untuk menampilkan sebuah website. Selain untuk menjalankan proses tersebut, HTTP juga mengatur bagaimana mengelola perintah yang masuk
								pada web server atau browser. Secara default HTTP menggunakan port 80.
							</p>
							<p className="fs-text">
								Contoh paling sederhana dari cara kerja HTTP adalah apabila Anda memasukkan sebuah URL ke kolom search browser, maka browser akan menjalankan perintah untuk menuju URL
								tersebut. Pada umumnya tampilan halaman website akan sesuai dengan URL yang dimasukkan.
							</p>
							<p className="fs-text">HTTP juga memiliki fungsi lain, yaitu mencegah agar data Anda tidak terancam dan aman dari pencuri data dan lain sebagainya.</p>
							<p className="fw-bold fs-text">Bagaimana Cara Kerja HTTP?</p>
							<p className="fs-text">Berikut adalah cara kerja HTTP:</p>
							<ol className="fs-text">
								<li>Pengguna membuat sambungan, lalu mengirim permintaan yang nantinya akan dijalankan oleh web server</li>
								<li>Pengguna menunggu respon selama HTTP memproses permintaan.</li>
								<li>Terakhir, web server akan memproses permintaan pengguna, lalu menutup sambungan.</li>
							</ol>

							<p className="fs-text">
								Secara singkat HTTP menunggu perintah dari pengguna terlebih dahulu sebelum menjalankan perintah, lalu mengirimkan respon berupa data yang diminta oleh pengguna, namun jenis
								data yang paling sering adalah HTML.
							</p>
						</div>

						<div className="d-flex flex-row gap-4 mt-5">
							<div className="d-flex">
								<a className="link" href="#">
									<img src="/assets/icons/icon-like.svg" alt="like" />
								</a>
								<p className="fs-text ms-2">3</p>
							</div>
							<div className="d-flex">
								<a href="#comment-form">
									<img src="/assets/icons/icon-coment.svg" alt="comment" />
								</a>
								<p className="fs-text ms-2">2</p>
							</div>
						</div>

						<div className={`${styles.comments} border_top thick row row-cols-1 gy-4 mt-5 pt-3`}>
							<div className={`${styles.comment__item} col  py-4`}>
								<div className="d-flex align-items-center">
									<img className="w-38" src="/assets/thumbs/thumb-blankProfile.png" alt="profile" />
									<div className="d-flex flex-column ms-3">
										<p className="fw-bold fs-6 mb-0">Adit</p>
										<p className="fw-light fs-12 mb-0">
											Guest <span className="mx-2 fw-bold fs-5">.</span>4 Sept
										</p>
									</div>
								</div>

								<p className="mt-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Neque enim diam orci commodo aliquam, tempor id lobortis. Aenean ut in est tellus in.</p>
							</div>

							<div className={`${styles.comment__item} col  py-4`}>
								<div className="d-flex align-items-center">
									<img className="w-38" src="/assets/thumbs/thumb-blankProfile.png" alt="profile" />
									<div className="d-flex flex-column ms-3">
										<p className="fw-bold fs-6 mb-0">Adit</p>
										<p className="fw-light fs-12 mb-0">
											Guest <span className="mx-2 fw-bold fs-5">.</span>4 Sept
										</p>
									</div>
								</div>

								<p className="mt-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Neque enim diam orci commodo aliquam, tempor id lobortis. Aenean ut in est tellus in.</p>
							</div>
						</div>

						<div className="mt-5">
							<p className="fw-light">
								<span className="fw-semibold">Comment as guest</span> or
								<span className="fw-semibold">
									<a className="text-decoration-none fc-white link" href="#">
										Login
									</a>
								</span>
							</p>

							<form id="comment-form" action="#">
								<label className="d-block mb-4 fw-semibold" htmlFor="name">
									Name
								</label>
								{/* <input className={`${styles.comment__name} mb-4`} type="text" name="name" id="comment-name" placeholder="Write your name here" /> */}

								<TextInput className={`${styles.comment__name} mb-4`} type="text" name="name" id={`${styles.comment__name}`} placeholder="Write your name here" />
								<label className="d-block mb-4 fw-semibold" htmlFor="comment">
									Comment
								</label>
								{/* <textarea className={`${styles.comment__text} mb-5`} name="comment" id="comment-text" rows={1} placeholder="Write your comment here"></textarea> */}
								<Textarea id={`${styles.comment__text}`} className={`mb-5`} name="comment" rows={1} placeholder="Write your comment here" autosize />
								<button className={`${styles.comment__button}`}>Post</button>
							</form>
						</div>
					</div>

					<div className={`${styles.aside__right} col-12 col-lg-4 position-relative p-0`}>
						<div className={`${styles.aside__right_container}`}>
							<div className={`${styles.creator__detail} px-0 px-lg-5 pb-4`}>
								<img className="w-80" src="/assets/icons/icon-logoKominfo.svg" alt="kominfo" />
								<p className="fw-bold fs-5 mt-4">Divisi Komunikasi dan Informasi</p>
								<p className="fs-6">
									Divisi Komunikasi dan Informasi adalah Lorem ipsum dolor sit amet, consectetur adipiscing elit. Egestas vulputate ornare rutrum leo tristique diam malesuada
								</p>
							</div>

							<div className="recommendation__blog px-0 px-lg-5 mt-5">
								<div className="row row-cols-1 g-4 g-lg-5">
									<div className="col">
										<div className="d-flex justify-content-between">
											<div>
												<div className="d-flex align-items-start gap-2">
													<img className="w-20" src="/assets/icons/icon-logoKominfo.svg" alt="kominfo" />
													<span className="fs-12 fw-light">
														<a className={`${colorScheme === "dark" ? "fc-white" : "text_dark_gray"} text-decoration-none link fw-semibold`} href="#">
															Divisi Komunikasi dan Informasi
														</a>
														<span className="mx-1">di</span>
														<a className={`${colorScheme === "dark" ? "fc-white" : "text_dark_gray"} text-decoration-none link fw-semibold`} href="#">
															Blog
														</a>
													</span>
												</div>

												<a className={`${colorScheme === "dark" ? "fc-white" : "text_dark_gray"} text-decoration-none d-block link fw-bold fs-6 mt-3`}>
													Martin Cooper – Penemu Telepon Genggam Pertama
												</a>
											</div>
											<a href="#" className="link">
												<img className="w-64" src="/assets/thumbs/blogs/thumb-blog1.png" alt="blog 1" />
											</a>
										</div>
									</div>
									<div className="col">
										<div className="d-flex justify-content-between">
											<div>
												<div className="d-flex align-items-start gap-2">
													<img className="w-20" src="/assets/icons/icon-logoKominfo.svg" alt="kominfo" />
													<span className="fs-12 fw-light">
														<a className={`${colorScheme === "dark" ? "fc-white" : "text_dark_gray"} text-decoration-none link fw-semibold`} href="#">
															Divisi Komunikasi dan Informasi
														</a>
														<span className="mx-1">di</span>
														<a className={`${colorScheme === "dark" ? "fc-white" : "text_dark_gray"} text-decoration-none link fw-semibold`} href="#">
															Blog
														</a>
													</span>
												</div>

												<a className={`${colorScheme === "dark" ? "fc-white" : "text_dark_gray"} text-decoration-none d-block link fw-bold fs-6 mt-3`}>
													Martin Cooper – Penemu Telepon Genggam Pertama
												</a>
											</div>
											<a href="#" className="link">
												<img className="w-64" src="/assets/thumbs/blogs/thumb-blog1.png" alt="blog 1" />
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default DetailBlog;
