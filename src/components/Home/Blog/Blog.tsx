import { IBlog } from "@/interfaces/db";
import Card from "@components/Template/Card/Card.template";
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
									return <Card key={blog?._id} {...blog} />;
							  })
							: null}
					</div>
				</div>
			</section>
		</>
	);
};

export default Blog;
