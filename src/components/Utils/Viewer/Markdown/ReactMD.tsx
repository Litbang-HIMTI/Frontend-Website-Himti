import rehypeRaw from "rehype-raw";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import ReactMarkdown from "react-markdown";

interface MDRenderProps {
	content: string;
}

export const ReactMD = ({ content }: MDRenderProps) => {
	return <ReactMarkdown children={content} rehypePlugins={[rehypeAutolinkHeadings, rehypeRaw]} />;
};
