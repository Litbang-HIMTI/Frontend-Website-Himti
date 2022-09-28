import { IBlog } from "@interfaces/db";

const Card = (props: IBlog) => {
	const formatedDate = (date: Date) => {
		return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
	};

	return (
		<div className="col">
			<a href="#" className="card border-0 position-relative start-0">
				<div className="card__arrow"></div>
				<div className="card__overlay"></div>
				<picture>
					<img src="/assets/thumbs/thumb-information-1.png" alt="blog" className="card__img card-img-top img-fluid" />
				</picture>
				<div className="card-body h-100 position-absolute d-flex flex-column justify-content-between p-3 p-md-4 p-lg-5">
					<p className="card-title mt-4 mt-md-3 mt-lg-2">{props?.title}</p>
					<p className="card-text">{formatedDate(props?.createdAt)}</p>
				</div>
			</a>
		</div>
	);
};

export default Card;
