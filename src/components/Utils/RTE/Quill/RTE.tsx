import { showNotification } from "@mantine/notifications";
import { ToolbarControl } from "@mantine/rte/lib/components/Toolbar/controls";
import { useCallback } from "react";
import { SERVER_LOCAL_V1 } from "../../../../helper";
import RichText from "./RTE_Import";

interface I_RTE {
	content: string;
	setContent: (content: string) => void;
	editable: boolean;
	controls: ToolbarControl[][];
	formats: string[];
}

export const RTE = ({ content, setContent, editable, controls, formats }: I_RTE) => {
	// image handler
	const toBase64 = (file: File) =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				showNotification({ title: "Loading", message: "Parsing image", autoClose: 1500 });
				resolve(reader.result);
			};
			reader.onerror = (error) => {
				showNotification({ title: "Error", message: `Fail to parse image`, color: "red" });
				reject(error);
			};
		});

	const handleImageUpload = useCallback(
		(file: File): Promise<string> =>
			new Promise(async (resolve, reject) => {
				const formData = {
					file: await toBase64(file),
				};

				fetch(`${SERVER_LOCAL_V1}/img/upload`, {
					method: "POST",
					body: JSON.stringify(formData),
				})
					.then((response) => response.json())
					.then((result) => {
						showNotification({ title: "Success", message: `Image uploaded at ${result.data.secure_url}`, color: "green" });
						resolve(result.data.secure_url);
					})
					.catch(() => {
						showNotification({ title: "Error", message: `Fail to upload image`, color: "red" });
						reject(new Error("Upload failed"));
					});
			}),
		[]
	);

	return (
		<>
			<RichText
				id="content"
				placeholder="Content..."
				value={content}
				onChange={setContent}
				mt="xs"
				controls={controls}
				formats={formats}
				readOnly={editable}
				onImageUpload={handleImageUpload}
			/>

			{content}
		</>
	);
};
