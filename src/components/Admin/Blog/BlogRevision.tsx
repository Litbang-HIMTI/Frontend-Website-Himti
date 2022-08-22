import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { showNotification } from "@mantine/notifications";
import { Box, Button, Group, LoadingOverlay, TextInput, Text, Select, Checkbox, MultiSelect, Textarea, useMantineColorScheme, Divider, Center } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { formatDateWithTz, SERVER_V1 } from "../../../helper";
import { IBlog, IBlogRevision } from "../../../interfaces/db";
import { TitleDashboard } from "../../Utils/Dashboard";
import { openConfirmModal } from "@mantine/modals";
import ReactDiffViewer from "react-diff-viewer";
import Link from "next/link";

interface IBlogFormProps extends IDashboardProps {
	blog?: IBlog;
	blogRevision?: IBlogRevision[];
}

export const BlogRevision: NextPage<IBlogFormProps> = (props) => {
	const { colorScheme } = useMantineColorScheme();
	const router = useRouter();
	const [loading, setLoading] = useState<boolean>(false);
	const [selectedIndex, setSelectedIndex] = useState<number>(0);
	const [tz, setTz] = useState<string>("UTC");
	const [revisionSelect, setRevisionSelect] = useState<any[]>([]);

	// ------------------------------------------------------------
	// handler
	const handleReplace = () => {
		openConfirmModal({
			title: "Submit confirmation",
			children: <Text size="sm">Are you sure you want to restore this revision? This action is irreversible, but don't worry the current post will be available in post revision.</Text>,
			labels: { confirm: "Yes, restore this revision", cancel: "No, cancel" },
			confirmProps: { color: "red" },
			onCancel: () => {},
			onConfirm: () => restoreForm(),
		});
	};
	const handleDelete = () => {
		openConfirmModal({
			title: "Delete confirmation",
			children: <Text size="sm">Are you sure you want to delete this revision? This action is irreversible, destructive, and there is no way to recover the deleted data.</Text>,
			labels: { confirm: "Yes, delete revision", cancel: "No, cancel" },
			confirmProps: { color: "red" },
			onCancel: () => {},
			onConfirm: () => deleteForm(),
		});
	};

	const deleteForm = async () => {
		setLoading(true);
		try {
			const req = await fetch(`${SERVER_V1}/blog/revision/${props.blogRevision![selectedIndex]._id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});
			const { message } = await req.json();

			if (req.status === 200) {
				showNotification({ title: "Revision deleted", message: message, disallowClose: true });

				// remove from list
				const newRevision = props.blogRevision!.filter((item, index) => index !== selectedIndex);
				setRevisionSelect(newRevision.map((item, index) => ({ label: `Revision ${item.revision} - ${formatDateWithTz(item.createdAt, tz)}`, value: index })));
				setSelectedIndex(0);
				setLoading(false);
			} else {
				setLoading(false);
				showNotification({ title: "Error", message, disallowClose: true, color: "red" });
			}
		} catch (error: any) {
			setLoading(false);
			showNotification({ title: "Error", message: error.message, disallowClose: true, color: "red" });
		}
	};

	const restoreForm = async () => {
		setLoading(true);

		try {
			const selectedRevision = props.blogRevision![selectedIndex];
			const { _id, blogId, revision, __v, author, ...restOfData } = selectedRevision;
			const req = await fetch(`${SERVER_V1}/blog/${props.blog!._id}`, {
				method: "PUT",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...restOfData,
				}),
			});
			const { message } = await req.json();

			if (req.status === 201 || req.status === 200) {
				showNotification({ title: "Success", message: message + ". Redirecting...", disallowClose: true });
				setTimeout(() => router.push(`../${props.blog?._id}`), 1500);
			} else {
				setLoading(false);
				showNotification({ title: "Error", message, disallowClose: true, color: "red" });
			}
		} catch (error: any) {
			setLoading(false);
			showNotification({ title: "Error", message: error.message, disallowClose: true, color: "red" });
		}
	};

	// ------------------------------------------------------------
	// page open
	useEffect(() => {
		setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
		setRevisionSelect(
			props.blogRevision && props.blogRevision.length > 0
				? props.blogRevision.map((revision, index) => {
						return {
							label: `Revision ${revision.revision} - ${formatDateWithTz(revision.createdAt, tz)}`,
							value: index.toString(),
						};
				  })
				: [{ label: "No Revision", value: "null" }]
		);
	}, []);

	return (
		<div style={{ position: "relative" }}>
			<TitleDashboard
				title={"Blog Revision History"}
				hrefLink={router.query.fromEdit === "true" ? `../${props.blog?._id}` : "../../blog"}
				hrefText={router.query.fromEdit === "true" ? "Back to edit" : "Back to blog posts"}
				HrefIcon={IconArrowLeft}
			/>
			<LoadingOverlay visible={loading} overlayBlur={3} />

			<Box>
				<Group mt={16}>
					<Group>
						<Select
							label="Select Revision"
							placeholder="Select Revision"
							value={selectedIndex.toString()}
							onChange={(value) => setSelectedIndex(value ? parseInt(value) : 0)}
							data={revisionSelect}
							sx={{ minWidth: "300px" }}
						/>
					</Group>

					<Group position="right" ml={"auto"} mt={16}>
						<Button
							color="red"
							onClick={handleDelete}
							disabled={isNaN(selectedIndex) || formatDateWithTz(props.blogRevision![selectedIndex].createdAt, tz) === formatDateWithTz(props.blog!.updatedAt, tz)}
						>
							Delete selected Revision
						</Button>
						<Button
							color="blue"
							onClick={handleReplace}
							disabled={isNaN(selectedIndex) || formatDateWithTz(props.blogRevision![selectedIndex].createdAt, tz) === formatDateWithTz(props.blog!.updatedAt, tz)}
						>
							Restore Selected Revision
						</Button>
					</Group>
				</Group>

				{props.blog && props.blogRevision && props.blogRevision.length > 0 ? (
					<Box mt="md">
						<ReactDiffViewer
							useDarkTheme={colorScheme === "dark"}
							oldValue={props.blogRevision[selectedIndex].content}
							leftTitle={`Revision ${props.blogRevision[selectedIndex].revision} Title: ` + props.blogRevision[selectedIndex].title}
							newValue={props.blog?.content}
							rightTitle={`Current Title: ` + props.blog?.title}
							splitView={true}
						/>

						<Group mt="md">
							<Group>
								<Box>
									<Text size="sm" mt="sm">
										Created at: {formatDateWithTz(props.blogRevision[selectedIndex].createdAt, tz)}
									</Text>
									<Text size="sm" mt="sm">
										Author:{" "}
										{props.blogRevision[selectedIndex] && props.blogRevision[selectedIndex].author && props.blogRevision[selectedIndex].author[0]
											? props.blogRevision[selectedIndex].author[0].username
											: "Deleted"}
									</Text>
									<Text size="sm" mt="sm">
										Thumbnail:{" "}
										<Text component="span" variant="link">
											{props.blogRevision[selectedIndex].thumbnail ? (
												<Link href={props.blogRevision[selectedIndex].thumbnail!}>
													<a>{props.blogRevision[selectedIndex].thumbnail}</a>
												</Link>
											) : (
												"None"
											)}
										</Text>
									</Text>
									<Text size="sm" mt="sm">
										Tags:
										<Text component="span" ml={4}>
											{props.blogRevision[selectedIndex].tags && props.blogRevision![selectedIndex].tags!.length > 0
												? props.blogRevision[selectedIndex].tags?.map((tags, i) => {
														return (
															<span key={i}>
																<Link href={`../tags?qAll=${tags}`}>
																	<a>
																		<Text component="span" variant="link">
																			{tags}
																		</Text>
																	</a>
																</Link>
																{i < props.blogRevision![selectedIndex].tags!.length - 1 ? ", " : ""}
															</span>
														);
												  })
												: "Deleted"}
										</Text>
									</Text>
									<Text size="sm" mt="sm">
										Visibility: {props.blogRevision[selectedIndex].visibility}
									</Text>
								</Box>
							</Group>

							<Group position="center" ml="auto">
								<Divider orientation="vertical" />
							</Group>

							<Group position="right" ml="auto">
								<Box>
									<Text size="sm" mt="sm">
										Last updated at: {formatDateWithTz(props.blog?.updatedAt!, tz)}
									</Text>
									<Text size="sm" mt="sm">
										Author: {props.blog && props.blog.editedBy && props.blog.editedBy[0] ? props.blog.editedBy[0].username : "Deleted"}
									</Text>
									<Text size="sm" mt="sm">
										Thumbnail:{" "}
										<Text component="span" variant="link">
											{props.blog?.thumbnail ? (
												<Link href={props.blog?.thumbnail!}>
													<a>{props.blog?.thumbnail}</a>
												</Link>
											) : (
												"None"
											)}
										</Text>
									</Text>
									<Text size="sm" mt="sm">
										Tags:
										<Text component="span" ml={4}>
											{props.blog.tags && props.blog.tags.length > 0
												? props.blog.tags.map((tags, i) => {
														return (
															<span key={i}>
																<Link href={`../tags?qAll=${tags}`}>
																	<a>
																		<Text component="span" variant="link">
																			{tags}
																		</Text>
																	</a>
																</Link>
																{i < props.blog!.tags!.length - 1 ? ", " : ""}
															</span>
														);
												  })
												: "Deleted"}
										</Text>
									</Text>
									<Text size="sm" mt="sm">
										Visibility: {props.blog?.visibility}
									</Text>
								</Box>
							</Group>
						</Group>
					</Box>
				) : (
					<Box mt={32}>
						<Center>
							<Text>No revisions found</Text>
						</Center>
					</Box>
				)}
			</Box>
		</div>
	);
};
