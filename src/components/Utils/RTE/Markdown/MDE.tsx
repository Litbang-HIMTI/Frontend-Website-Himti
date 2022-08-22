import { ChangeEvent, useCallback } from "react";
import { SERVER_LOCAL_V1 } from "../../../../helper";
import { ActionIcon, Button, Group, Text, TextInput, Tooltip, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { showNotification, updateNotification } from "@mantine/notifications";
import { closeAllModals, openModal } from "@mantine/modals";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { ContextStore } from "@uiw/react-md-editor";
import { MDEditor } from "./MDE_Import";
import {
	bold,
	divider,
	hr,
	italic,
	strikethrough,
	title1,
	title2,
	title3,
	title4,
	unorderedListCommand,
	orderedListCommand,
	checkedListCommand,
	link,
	quote,
	code,
	codeBlock,
} from "@uiw/react-md-editor/lib/commands";
import {
	IconUpload,
	IconPhoto,
	IconX,
	IconStrikethrough,
	IconVideo,
	IconCirclePlus,
	IconSuperscript,
	IconSubscript,
	IconBold,
	IconItalic,
	IconUnderline,
	IconSeparator,
	IconH1,
	IconH2,
	IconH3,
	IconH4,
	IconLink,
	IconQuote,
	IconCode,
	IconBarcode,
	IconList,
	IconListNumbers,
	IconListCheck,
	IconLayoutAlignLeft,
	IconLayoutAlignRight,
	IconLayoutAlignCenter,
	IconFloatLeft,
	IconFloatCenter,
	IconFloatRight,
	IconMaximize,
} from "@tabler/icons";

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
				showNotification({ id: `Loading-data`, title: "Loading", message: "Parsing image. Please wait...", disallowClose: true, loading: true, autoClose: false });
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
				updateNotification({ id: "Loading-data", title: "Loading", message: "Uploading. Please wait...", disallowClose: true, loading: true, autoClose: false });

				fetch(`${SERVER_LOCAL_V1}/img/upload`, {
					method: "POST",
					body: JSON.stringify(formData),
				})
					.then((response) => response.json())
					.then((result) => {
						updateNotification({
							id: "Loading-data",
							title: "Success",
							message: `Image uploaded at ${result.data.secure_url}`,
							color: "green",
							disallowClose: true,
							loading: false,
							autoClose: 5000,
						});
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
									return content + `\n![alt text](${url})\n`;
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
						label={
							<Text>
								Or paste image URL (Secure/HTTPS) here
								<Text size="xs" color="dimmed" inline>
									(Use the plus icon to add)
								</Text>
							</Text>
						}
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							img_url_input = e.target.value;
						}}
						rightSection={
							<>
								<Tooltip label="Add to textfield">
									<ActionIcon>
										<IconCirclePlus
											onClick={() => {
												setContent((content: string) => {
													return content + `\n![alt text](${img_url_input})\n`;
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

	const openDialogYTUrl = () => {
		let yt_url_input = "",
			re = /(https?:\/\/)?(((m|www)\.)?(youtube(-nocookie)?|youtube.googleapis)\.com.*(v\/|v=|vi=|vi\/|e\/|embed\/|user\/.*\/u\/\d+\/)|youtu\.be\/)([_0-9a-z-]+)/i;
		openModal({
			title: "Youtube URL",
			children: (
				<div>
					<TextInput
						placeholder="https://www.youtube.com/watch?v=123456789"
						label={
							<Text>
								Paste Youtube URL here
								<Text size="xs" color="dimmed" inline>
									(Use the plus icon to add)
								</Text>
							</Text>
						}
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							yt_url_input = e.target.value;
						}}
						rightSection={
							<>
								<Tooltip label="Add to textfield">
									<ActionIcon>
										<IconCirclePlus
											onClick={() => {
												const matchedId = yt_url_input.match(re);

												if (!matchedId || matchedId.length < 8) {
													return showNotification({ title: "Error", message: `Invalid Youtube URL`, color: "red", disallowClose: true });
												}

												setContent((content: string) => {
													return (
														content +
														`\n\n<iframe allowfullscreen={true} type="text/html" src="http://www.youtube.com/embed/${matchedId[8]}` +
														`?enablejsapi=1&origin=${window ? window.location.host : ""}" frameborder="0" title="Youtube video embed" style="width: 90%; height: 400px;"/>\n\n`
													);
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

	const commandLists = [
		{ name: "bold", icon: IconBold, title: "Insert Bold" },
		{ name: "italic", icon: IconItalic, title: "Insert Italic" },
		{ name: "underline", icon: IconUnderline, title: "Insert Underline" },
		{ name: "strikethrough", icon: IconStrikethrough, title: "Insert Strikethrough" },
		{ name: "superscript", icon: IconSuperscript, title: "Insert Superscript" },
		{ name: "subscript", icon: IconSubscript, title: "Insert Subscript" },
		{ name: "hr", icon: IconSeparator, title: "Insert Horizontal Rule" },
		{ name: "title1", icon: IconH1, title: "Insert Heading 1" },
		{ name: "title2", icon: IconH2, title: "Insert Heading 2" },
		{ name: "title3", icon: IconH3, title: "Insert Heading 3" },
		{ name: "title4", icon: IconH4, title: "Insert Heading 4" },
		{ name: "unordered-list", icon: IconList, title: "Insert Unordered List" },
		{ name: "ordered-list", icon: IconListNumbers, title: "Insert Ordered List" },
		{ name: "checked-list", icon: IconListCheck, title: "Insert Task List" },
		{ name: "link", icon: IconLink, title: "Insert Link" },
		{ name: "quote", icon: IconQuote, title: "Insert Quote" },
		{ name: "code", icon: IconCode, title: "Insert Code" },
		{ name: "codeBlock", icon: IconBarcode, title: "Insert Code block" },
		{ name: "edit", icon: IconLayoutAlignLeft, title: "Edit Code" },
		{ name: "live", icon: IconLayoutAlignCenter, title: "Live Code" },
		{ name: "preview", icon: IconLayoutAlignRight, title: "Preview Code" },
		{ name: "fullscreen", icon: IconMaximize, title: "Fullscreen" },
		{ name: "alignLeft", icon: IconFloatLeft, title: "Align left" },
		{ name: "alignRight", icon: IconFloatRight, title: "Align right" },
		{ name: "alignCenter", icon: IconFloatCenter, title: "Align center" },
	];

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
				// preview={editable ? "preview" : "live"}
				hideToolbar={editable} // better enable/disable
				components={{
					toolbar: (command, disabled, executeCommand) => {
						if (commandLists.find((item) => item.name === command.name)) {
							const index = commandLists.findIndex((item) => item.name === command.name);
							const Icon = commandLists[index].icon;

							return (
								<>
									<Tooltip label={commandLists[index].title} withinPortal>
										<Button
											disabled={disabled}
											onClick={() => {
												executeCommand(command, command.groupName);
											}}
										>
											<Icon size={13} />
										</Button>
									</Tooltip>
								</>
							);
						}

						if (command.name === "image") {
							return (
								<>
									<Tooltip label="Upload image (file/link)" withinPortal>
										<Button
											disabled={disabled}
											onClick={() => {
												openDialogFileImage();
											}}
										>
											<IconPhoto size={13} />
										</Button>
									</Tooltip>
									<Tooltip label="Embed youtube video" withinPortal>
										<Button
											disabled={disabled}
											onClick={() => {
												openDialogYTUrl();
											}}
										>
											<IconVideo size={13} />
										</Button>
									</Tooltip>
								</>
							);
						}
					},
				}}
				previewOptions={{
					rehypePlugins: [
						// [rehypeSanitize] // disable iframe
					],
				}}
				commands={[
					bold,
					italic,
					{
						name: "underline",
						keyCommand: "underline",
						icon: <IconUnderline size={13} />,
						shortcuts: "mod+u",
						execute: (state, api) => {
							const modifyText = `<u>${state.selectedText}</u>`;
							api.replaceSelection(modifyText);
						},
					},
					strikethrough,
					{
						name: "superscript",
						keyCommand: "superscript",
						icon: <IconSuperscript size={13} />,
						execute: (state, api) => {
							const modifyText = `<sup>${state.selectedText}</sup>`;
							api.replaceSelection(modifyText);
						},
					},
					{
						name: "subscript",
						keyCommand: "subscript",
						icon: <IconSubscript size={13} />,
						execute: (state, api) => {
							const modifyText = `<sub>${state.selectedText}</sub>`;
							api.replaceSelection(modifyText);
						},
					},
					// -------------
					divider,
					quote,
					code,
					codeBlock,
					// -------------
					divider,
					unorderedListCommand,
					orderedListCommand,
					checkedListCommand,
					{
						name: "alignLeft",
						keyCommand: "alignLeft",
						icon: <IconFloatLeft size={13} />,
						execute: (state, api) => {
							const modifyText = `<div style="text-align: left;">${state.selectedText}</div>`;
							api.replaceSelection(modifyText);
						},
					},
					{
						name: "alignCenter",
						keyCommand: "alignCenter",
						icon: <IconFloatCenter size={13} />,
						execute: (state, api) => {
							const modifyText = `<div style="text-align: center;">${state.selectedText}</div>`;
							api.replaceSelection(modifyText);
						},
					},
					{
						name: "alignRight",
						keyCommand: "alignRight",
						icon: <IconFloatRight size={13} />,
						execute: (state, api) => {
							const modifyText = `<div style="text-align: right;">${state.selectedText}</div>`;
							api.replaceSelection(modifyText);
						},
					},
					// -------------
					divider,
					hr,
					title1,
					title2,
					title3,
					title4,
					// -------------
					divider,
					link,
					{
						// this will be replaced by the one in the components prop
						name: "image",
						keyCommand: "image",
						buttonProps: { "aria-label": "Insert image" },
						icon: <IconPhoto size={13} />,
					},
				]}
			/>
		</div>
	);
};
