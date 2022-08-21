import { Breadcrumbs, Button, Skeleton, Text } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { TablerIcon, IconFilePlus } from "@tabler/icons";
import { useEffect, useState } from "react";

export const TitleDashboard = ({ title, hrefLink, hrefText, HrefIcon = IconFilePlus, mb }: { title: string; hrefLink?: string; hrefText?: string; HrefIcon?: TablerIcon; mb?: string }) => {
	const router = useRouter();
	const [links, setLinks] = useState<string[]>([]);
	const getPath = () => {
		return router.asPath
			.split("?")[0]
			.split("#")[0]
			.split("/")
			.slice(1)
			.map((item) => {
				return item.charAt(0).toUpperCase() + item.slice(1);
			})
			.filter((item) => item);
	};

	useEffect(() => {
		setLinks(getPath());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="dash-flex-column" style={{ marginBottom: mb ? mb : "1.5rem" }}>
			<div className="dash-flex">
				<h1>{title}</h1>
				{hrefLink && hrefText && (
					<Link href={hrefLink}>
						<a>
							<Button id="dash-add-new" ml={16} size="xs" compact leftIcon={<HrefIcon size={20} />}>
								{hrefText}
							</Button>
						</a>
					</Link>
				)}
			</div>
			<Breadcrumbs mt={6}>
				{links.length > 1 ? (
					links.map((item, index) => {
						return (
							<Link
								key={index}
								href={
									"/" +
									links
										.slice(0, index + 1)
										.join("/")
										.toLowerCase()
								}
							>
								<a>
									<Text variant="link">{item}</Text>
								</a>
							</Link>
						);
					})
				) : (
					<Skeleton visible={links.length < 1} mt={links.length < 1 ? 6 : 0} width={130} height={19} />
				)}
			</Breadcrumbs>
		</div>
	);
};
