import { Button } from "@mantine/core";
import Link from "next/link";
import { TablerIcon, IconFilePlus } from "@tabler/icons";

export const TitleDashboard = ({ title, hrefLink, hrefText, HrefIcon = IconFilePlus, mb }: { title: string; hrefLink?: string; hrefText?: string; HrefIcon?: TablerIcon; mb?: string }) => {
	return (
		<div className="dash-flex" style={{ marginBottom: mb ? mb : "1.5rem" }}>
			<h1>{title}</h1>
			{hrefLink && hrefText && (
				<Link href={hrefLink}>
					<Button id="dash-add-new" ml={16} size="xs" compact leftIcon={<HrefIcon size={20} />}>
						{hrefText}
					</Button>
				</Link>
			)}
		</div>
	);
};
