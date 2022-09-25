import { IBlog } from "@/interfaces/db";
import styles from "../Home.module.css";

const Blog = ({ dataBlogs }: { dataBlogs: IBlog[] | null }) => {
	const formatedDate = (date: Date) => {
		return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
	};

	return (
		<>
			<section id="blog" className="container">
				<div className={`${styles.content} border_top thick`}>
					<p tabIndex={0} className={`${styles.section__title} mt-2 mt-md-4`}>
						Blog
					</p>
					<div className="row row-cols-1 row-cols-md-2 g-4">
						{dataBlogs
							? dataBlogs.map((blog) => {
									return (
										<div className="blog__card col" key={blog?._id}>
											<a href="#" className="card border-0 position-relative start-0">
												<div className="card__arrow"></div>
												<div className="card__overlay"></div>
												<picture>
													<img src="/assets/thumbs/thumb-information-1.png" alt="blog" className="card__img card-img-top img-fluid" />
												</picture>
												<div className="card-body h-100 position-absolute d-flex flex-column justify-content-between p-3 p-md-4 p-lg-5">
													<p className="card-title mt-4 mt-md-3 mt-lg-2">{blog?.title}</p>
													<p className="card-text">{formatedDate(blog?.createdAt)}</p>
												</div>
											</a>
										</div>
									);
							  })
							: null}
					</div>
				</div>
			</section>
		</>
	);
};

export default Blog;
