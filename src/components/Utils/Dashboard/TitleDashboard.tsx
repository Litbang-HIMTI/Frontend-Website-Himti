import { Button } from "@mantine/core";
import Link from "next/link";
import { IconFilePlus } from "@tabler/icons";

export const TitleDashboard = ({ title, hrefAddNew }: { title: string; hrefAddNew?: string }) => {
	return (
		<div className="dash-flex">
			<h1>{title}</h1>
			{hrefAddNew && (
				<Link href={"note/create"}>
					<Button id="dash-add-new" ml={16} size="xs" compact leftIcon={<IconFilePlus size={20} />}>
						Add new
					</Button>
				</Link>
			)}
		</div>
	);
};
