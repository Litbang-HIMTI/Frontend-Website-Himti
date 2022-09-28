import { NextPage } from "next";

const Forum: NextPage = () => {
	return (
		<>
			<div id="main__container">
				<section id="blog" className="container">
					<p tabIndex={0} className="fs-title mt-2 mb-4 mb-md-5">
						Forum Diskusi
					</p>
					<div className="row row-cols-1 row-cols-md-2 g-4">
						<div className="forum__card col">
							<a href="#" className="card border-0 position-relative start-0">
								<div className="card__arrow"></div>
								<div className="card__overlay"></div>
								<img src="../../assets/thumbs/thumb-information-1.png" alt="blog" className="card-img-top img-fluid" />
								<div className="card-body h-100 position-absolute d-flex flex-column justify-content-between p-3 p-md-4 p-lg-5">
									<p className="card-title mt-4 mt-md-3 mt-lg-2">Suara Publik Bulan Agustus</p>

									<p className="card-text">03 Agustus 2022</p>
								</div>
							</a>
						</div>
						<div className="forum__card col">
							<a href="#" className="card border-0 position-relative start-0">
								<div className="card__arrow"></div>
								<div className="card__overlay"></div>
								<img src="../../assets/thumbs/thumb-information-2.png" alt="blog" className="card-img-top img-fluid" />
								<div className="card-body h-100 position-absolute d-flex flex-column justify-content-between p-3 p-md-4 p-lg-5">
									<p className="card-title mt-4 mt-md-3 mt-lg-2">Suara Publik Bulan September</p>

									<p className="card-text">03 September 2022</p>
								</div>
							</a>
						</div>
					</div>
				</section>

				<section id="pagination" className="container mt-5">
					<nav aria-label="Page navigation example">
						<ul className="pagination justify-content-center justify-content-lg-start">
							<li className="page-item">
								<a className="page-link" href="#" aria-label="Previous">
									<span aria-hidden="true">
										<img className="pagination__prev pagination__arrow" src="../../assets/icons/icon-arrow-pagination.svg" alt="previous page" />
									</span>
								</a>
							</li>
							<li className="page-item">
								<a className="page-link" href="#">
									1
								</a>
							</li>
							<li className="page-item">
								<a className="page-link" href="#">
									2
								</a>
							</li>
							<li className="page-item">
								<a className="page-link" href="#">
									3
								</a>
							</li>
							<li className="page-item">
								<a className="page-link" href="#">
									4
								</a>
							</li>
							<li className="page-item">
								<a className="page-link" href="#" aria-label="Next">
									<span aria-hidden="true">
										<img className="pagination__next pagination__arrow" src="../../assets/icons/icon-arrow-pagination.svg" alt="previous page" />
									</span>
								</a>
							</li>
						</ul>
					</nav>
				</section>
			</div>
		</>
	);
};

export default Forum;
