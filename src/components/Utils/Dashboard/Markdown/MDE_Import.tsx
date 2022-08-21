import dynamic from "next/dynamic";
import { MDEditorProps } from "@uiw/react-md-editor";
export const MDEditor = dynamic<MDEditorProps>(() => import("@uiw/react-md-editor").then((mod) => mod.default), { ssr: false });
export const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview").then((mod) => mod.default), { ssr: false });
