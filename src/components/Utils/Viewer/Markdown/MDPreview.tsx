import { useMantineColorScheme } from "@mantine/core";
import rehypeRaw from "rehype-raw";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { MarkdownPreview } from "../../RTE/Markdown/MDE_Import";

interface MDRenderProps {
	content: string;
}

export const MDPreview = ({ content }: MDRenderProps) => {
	const { colorScheme } = useMantineColorScheme();

	return (
		<div data-color-mode={colorScheme}>
			<MarkdownPreview source={content} rehypePlugins={[rehypeAutolinkHeadings, rehypeRaw]} />
		</div>
	);
};
