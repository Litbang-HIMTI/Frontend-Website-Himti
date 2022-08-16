import { Button } from "@mantine/core";
import Link from "next/link";
import { IconFilePlus } from "@tabler/icons";

export const TitleDashboard = ({ title, hrefAddNew, mb }: { title: string; hrefAddNew?: string; mb?: string }) => {
	return (
		<div className="dash-flex" style={{ marginBottom: mb ? mb : "1.5rem" }}>
			<h1>{title}</h1>
			{hrefAddNew && (
				<Link href={hrefAddNew}>
					<Button id="dash-add-new" ml={16} size="xs" compact leftIcon={<IconFilePlus size={20} />}>
						Add new
					</Button>
				</Link>
			)}
		</div>
	);
};
