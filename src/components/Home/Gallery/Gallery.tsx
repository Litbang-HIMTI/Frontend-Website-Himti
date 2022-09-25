import { NextPage } from "next";
import styles from "../Home.module.css";

const Gallery: NextPage = () => {
	return (
		<section id="gallery" className="container">
			<div className="content border_top thick">
				<p tabIndex={0} className="section__title mt-2 mt-md-4">
					Gallery
				</p>
				<div className="row row-cols-1 g-4 row-cols-sm-2 row-cols-lg-3 justify-content-between">
					<div className="col">
						<div tabIndex={0} aria-label="gallery Teknik Informatika UIN Jakarta" data-bs-toggle="modal" data-bs-target="#gallery-1">
							<picture>
								<img className={`${styles.border__gallery} w-100 img-fluid`} src="/assets/thumbs/thumb-gallery-1.png" alt="gallery photo 1" />
							</picture>
						</div>
						<div className="modal fade" id="gallery-1" aria-labelledby="gallery-1" aria-hidden="true">
							<div className="modal-dialog modal-dialog-centered">
								<div className="modal-content">
									<picture>
										<img className="w-100 img-fluid" src="/assets/thumbs/thumb-gallery-1.png" alt="gallery photo 1" />
									</picture>
								</div>
							</div>
						</div>
					</div>
					<div className="col">
						<div tabIndex={0} aria-label="gallery Teknik Informatika UIN Jakarta" data-bs-toggle="modal" data-bs-target="#gallery-2">
							<img className={`${styles.border__gallery} w-100 img-fluid`} src="/assets/thumbs/thumb-gallery-2.png" alt="gallery photo 2" />
						</div>
						<div className="modal fade" id="gallery-2" aria-labelledby="gallery-2" aria-hidden="true">
							<div className="modal-dialog modal-dialog-centered">
								<div className="modal-content">
									<picture>
										<img className="w-100 img-fluid" src="/assets/thumbs/thumb-gallery-2.png" alt="gallery photo 2" />
									</picture>
								</div>
							</div>
						</div>
					</div>
					<div className="col">
						<div tabIndex={0} aria-label="gallery Teknik Informatika UIN Jakarta" data-bs-toggle="modal" data-bs-target="#gallery-3">
							<picture>
								<img className={`${styles.border__gallery} w-100 img-fluid`} src="/assets/thumbs/thumb-gallery-3.png" alt="gallery photo 3" />
							</picture>
						</div>

						<div className="modal fade" id="gallery-3" aria-labelledby="gallery-3" aria-hidden="true">
							<div tabIndex={0} aria-label="gallery Teknik Informatika UIN Jakarta" className="modal-dialog modal-dialog-centered">
								<div className="modal-content">
									<picture>
										<img className="w-100 img-fluid" src="/assets/thumbs/thumb-gallery-3.png" alt="gallery photo 3" />
									</picture>
								</div>
							</div>
						</div>
					</div>
					<div className="col">
						<picture>
							<img className={`${styles.border__gallery} w-100 img-fluid`} src="/assets/thumbs/thumb-gallery-4.png" alt="gallery photo 4" />
						</picture>
					</div>
					<div className="col">
						<picture>
							<img className={`${styles.border__gallery} w-100 img-fluid`} src="/assets/thumbs/thumb-gallery-5.png" alt="gallery photo 5" />
						</picture>
					</div>
					<div className="col">
						<picture>
							<img className={`${styles.border__gallery} w-100 img-fluid`} src="/assets/thumbs/thumb-gallery-6.png" alt="gallery photo 6" />
						</picture>
					</div>
					<div className="col">
						<picture>
							<img className={`${styles.border__gallery} w-100 img-fluid`} src="/assets/thumbs/thumb-gallery-7.png" alt="gallery photo 7" />
						</picture>
					</div>
					<div className="col">
						<picture>
							<img className={`${styles.border__gallery} w-100 img-fluid`} src="/assets/thumbs/thumb-gallery-8.png" alt="gallery photo 8" />
						</picture>
					</div>
					<div className="col">
						<picture>
							<img className={`${styles.border__gallery} w-100 img-fluid`} src="/assets/thumbs/thumb-gallery-9.png" alt="gallery photo 9" />
						</picture>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Gallery;
