import { NextPage } from "next";
import styles from "../Home.module.css";

const Information = () => {
	return (
		<>
			<section id="important-information" className="container">
				<div className={`${styles.content}  border_top thick`}>
					<p tabIndex={0} className={`${styles.section__title} mt-2 mt-md-4`}>
						Informasi Penting
					</p>
					<div className="row row-cols-1 row-cols-md-2 g-4">
						<div className="information__card col">
							<a href="#" className="card border-0 position-relative start-0">
								<div className="card__arrow"></div>
								<div className="card__overlay"></div>

								<picture>
									<img src="/assets/thumbs/thumb-information-1.png" alt="information" className="card__img card-img-top img-fluid" />
								</picture>

								<div className="card-body h-100 position-absolute d-flex flex-column justify-content-between p-3 p-md-4 p-lg-5">
									<p className="card-title mt-4 mt-md-3 mt-lg-2">Open Recruitment Panitia PBAK Jurusan 2022</p>
									<p className="card-text">29 Juli 2022</p>
								</div>
							</a>
						</div>
						<div className="information__card col">
							<a href="#" className="card border-0 position-relative start-0">
								<div className="card__arrow"></div>
								<div className="card__overlay"></div>

								<picture>
									<img src="/assets/thumbs/thumb-information-2.png" alt="information" className="card__img card-img-top img-fluid" />
								</picture>
								<div className="card-body h-100 position-absolute d-flex flex-column justify-content-between p-3 p-md-4 p-lg-5">
									<p className="card-title mt-4 mt-md-3 mt-lg-2">Prosedur Cicilan UKT Mahasiswa Fakultas Sains dan Teknologi</p>

									<p className="card-text">02 Agustus 2022</p>
								</div>
							</a>
						</div>
					</div>
				</div>
			</section>
		</>
	);
};

export default Information;
