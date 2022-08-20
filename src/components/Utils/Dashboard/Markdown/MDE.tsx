import { ChangeEvent, useCallback, useState } from "react";
import { ActionIcon, Button, Group, LoadingOverlay, Text, TextInput, Tooltip, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { ContextStore } from "@uiw/react-md-editor";
import { SERVER_LOCAL_V1 } from "../../../../helper";
import { MDEditor } from "./MDE_Import";
import { closeAllModals, openModal } from "@mantine/modals";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons";
import rehypeSanitize from "rehype-sanitize";

interface I_RTE {
	content: string;
	setContent: (content: any) => any;
	editable: boolean;
}

export const MDE = ({ content, setContent, editable }: I_RTE) => {
	const { colorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();

	// image handler
	const toBase64 = (file: File) =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				showNotification({ title: "Loading", message: "Parsing image", disallowClose: true });
				resolve(reader.result);
			};
			reader.onerror = (error) => {
				showNotification({ title: "Error", message: `Fail to parse image`, color: "red", disallowClose: true });
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
						showNotification({ title: "Success", message: `Image uploaded at ${result.data.secure_url}`, color: "green", disallowClose: true });
						resolve(result.data.secure_url);
					})
					.catch(() => {
						showNotification({ title: "Error", message: `Fail to upload image`, color: "red", disallowClose: true });
					});
			}),
		[]
	);

	const openDialogFileImage = () => {
		let img_url_input = "";
		openModal({
			title: "Image Upload",
			children: (
				<div>
					<Dropzone
						accept={IMAGE_MIME_TYPE}
						onDrop={async (files) => {
							files.forEach(async (file) => {
								const url = await handleImageUpload(file);
								setContent((content: string) => {
									return content + `![alt text](${url})\n`;
								});
							});
						}}
						onReject={(files) => {
							showNotification({ title: "Error", message: `Fail to select image`, color: "red", disallowClose: true });
						}}
						maxSize={4194304} // 4MB
					>
						<Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: "none" }}>
							<Dropzone.Accept>
								<IconUpload size={50} stroke={1.5} color={theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 4 : 6]} />
							</Dropzone.Accept>
							<Dropzone.Reject>
								<IconX size={50} stroke={1.5} color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]} />
							</Dropzone.Reject>
							<Dropzone.Idle>
								<IconPhoto size={50} stroke={1.5} />
							</Dropzone.Idle>

							<div>
								<Text size="xl" inline>
									Drag images here or click to select files
								</Text>
								<Text size="sm" color="dimmed" inline mt={7}>
									Attach as many files as you like, each file should not exceed 4mb
								</Text>
							</div>
						</Group>
					</Dropzone>

					<TextInput
						mt={6}
						placeholder="https://cooldomain.com/image.png"
						label="Or you can paste image URL here"
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							img_url_input = e.target.value;
						}}
						rightSection={
							<>
								<Tooltip label="Add to textfield">
									<ActionIcon>
										<IconPhoto
											onClick={() => {
												setContent((content: string) => {
													return content + `![alt text](${img_url_input})`;
												});
											}}
										/>
									</ActionIcon>
								</Tooltip>
							</>
						}
					/>

					<Button fullWidth onClick={() => closeAllModals()} mt="md">
						Close
					</Button>
				</div>
			),
		});
	};

	const handleOnChange = (value: string | undefined, _event: ChangeEvent<HTMLTextAreaElement> | undefined, _state: ContextStore | undefined) => {
		setContent(value!);
	};

	return (
		<div data-color-mode={colorScheme}>
			<MDEditor
				value={content}
				onChange={handleOnChange}
				style={{ marginTop: ".5rem" }}
				height={600}
				textareaProps={{
					disabled: editable,
					placeholder: "Write your content here",
				}}
				components={{
					toolbar: (command, disabled, executeCommand) => {
						if (command.keyCommand === "image") {
							return (
								<>
									<Tooltip label="Upload image (file)" withinPortal>
										<Button
											disabled={disabled}
											onClick={() => {
												openDialogFileImage();
											}}
										>
											<IconPhoto size={13} />
										</Button>
									</Tooltip>
								</>
							);
						}
					},
				}}
				previewOptions={{
					rehypePlugins: [[rehypeSanitize]],
				}}
			/>
		</div>
	);
};
