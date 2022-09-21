import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import Link from "next/link";
import { Group, useMantineColorScheme } from "@mantine/core";
import { IconLink } from "@tabler/icons";
import { ReactNode } from "react";

interface MDRenderProps {
	content: string;
}

interface MDRenderProps {
	content: string;
	className?: string;
}

const replaceHeader = (text: ReactNode & ReactNode[], size: number) => {
	return (
		<Link href={"#" + String(text).replace(/ /g, "-")}>
			<Group spacing={4} className="pointer">
				<IconLink size={size} /> {text}
			</Group>
		</Link>
	);
};

export const ReactMD = ({ content, className }: MDRenderProps) => {
	const { colorScheme } = useMantineColorScheme();
	return (
		<ReactMarkdown
			className={className + ` wmde-markdown ${colorScheme}`}
			remarkPlugins={[gfm]}
			rehypePlugins={[rehypeAutolinkHeadings, rehypeRaw]}
			components={{
				h1: ({ children, ...props }) => {
					return (
						<h1 {...props} id={String(children).replace(/ /g, "-")}>
							{replaceHeader(children, 24)}
						</h1>
					);
				},
				h2: ({ children, ...props }) => {
					return (
						<h2 {...props} id={String(children).replace(/ /g, "-")}>
							{replaceHeader(children, 20)}
						</h2>
					);
				},
				h3: ({ children, ...props }) => {
					return (
						<h3 {...props} id={String(children).replace(/ /g, "-")}>
							{replaceHeader(children, 16)}
						</h3>
					);
				},
				h4: ({ children, ...props }) => {
					return (
						<h4 {...props} id={String(children).replace(/ /g, "-")}>
							{replaceHeader(children, 14)}
						</h4>
					);
				},
				h5: ({ children, ...props }) => {
					return (
						<h5 {...props} id={String(children).replace(/ /g, "-")}>
							{replaceHeader(children, 12)}
						</h5>
					);
				},
				h6: ({ children, ...props }) => {
					return (
						<h6 {...props} id={String(children).replace(/ /g, "-")}>
							{replaceHeader(children, 10)}
						</h6>
					);
				},
			}}
		>
			{content}
		</ReactMarkdown>
	);
};
