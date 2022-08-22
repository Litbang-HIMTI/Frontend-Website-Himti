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
	const [tz, setTz] = useState<string>("UTC");
	const [loading, setLoading] = useState<boolean>(false);

	const [selectedIndex, setSelectedIndex] = useState<number>(0);
	const [compareIndex, setCompareIndex] = useState<number>(0);
	const [revisionSelect, setRevisionSelect] = useState<any[]>([]);
	const [compareSelect, setCompareSelect] = useState<any[]>([]);
	const [revisionData, setRevisionData] = useState<IBlogRevision[]>([]);
	const [compareData, setCompareData] = useState<IBlogRevision[]>([]);

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
			const req = await fetch(`${SERVER_V1}/blog/revision/${revisionData![selectedIndex]._id}`, {
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
				const newRevision = revisionData!.filter((item, index) => index !== selectedIndex);
				setRevisionSelect(newRevision.map((item, index) => ({ label: `Revision ${item.revision} - ${formatDateWithTz(item.createdAt, tz)}`, value: index.toString() })));
				setCompareSelect(
					[props.blog!, ...newRevision].map((revision: IBlogRevision, index) => {
						return {
							label: `${revision.revision ? `Revision ${revision.revision}` : "Current Post"} - ${formatDateWithTz(revision.createdAt, tz)}`,
							value: index.toString(),
						};
					})
				);
				setRevisionData(newRevision);
				setCompareData([props.blog!, ...newRevision]);
				setSelectedIndex(0);
				setCompareIndex(0);
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
			const selectedRevision = revisionData![selectedIndex];
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
		setRevisionData(props.blogRevision!);
		setCompareData([props.blog!, ...props.blogRevision!]); // set revision data with props.blog and props.blogRevision combined
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
		setCompareSelect(
			[props.blog!, ...props.blogRevision!].map((revision: IBlogRevision, index) => {
				return {
					label: `${revision.revision ? `Revision ${revision.revision}` : "Current Post"} - ${formatDateWithTz(revision.createdAt, tz)}`,
					value: index.toString(),
				};
			})
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
						<Select
							label="Compare with"
							placeholder="Compare with"
							value={compareIndex.toString()}
							onChange={(value) => setCompareIndex(value ? parseInt(value) : 0)}
							data={compareSelect}
							sx={{ minWidth: "300px" }}
						/>
					</Group>

					{props.blog && revisionData && revisionData.length > 0 && (
						<Group position="right" ml={"auto"} mt={16}>
							<Button
								color="red"
								onClick={handleDelete}
								disabled={isNaN(selectedIndex) || formatDateWithTz(revisionData[selectedIndex]?.createdAt, tz) === formatDateWithTz(props.blog!.updatedAt, tz)}
							>
								Delete selected Revision
							</Button>
							<Button
								color="blue"
								onClick={handleReplace}
								disabled={isNaN(selectedIndex) || formatDateWithTz(revisionData[selectedIndex]?.createdAt, tz) === formatDateWithTz(props.blog!.updatedAt, tz)}
							>
								Restore Selected Revision
							</Button>
						</Group>
					)}
				</Group>

				{props.blog && revisionData && revisionData.length > 0 ? (
					<Box mt="md">
						<ReactDiffViewer
							useDarkTheme={colorScheme === "dark"}
							oldValue={revisionData[selectedIndex].content}
							leftTitle={`Revision ${revisionData[selectedIndex].revision}\nTitle: ` + revisionData[selectedIndex].title + "\n\nDescription:\n" + revisionData[selectedIndex].description}
							newValue={compareData[compareIndex].content}
							rightTitle={
								`${compareData[compareIndex].revision ? `Revision ${compareData[compareIndex].revision}\n` : `Current`}\nTitle: ` +
								props.blog?.title +
								"\n\nDescription:\n" +
								props.blog?.description
							}
							splitView={true}
						/>

						<Group mt="md">
							<Group>
								<Box>
									<Text size="sm" mt="sm">
										Created at: {formatDateWithTz(revisionData[selectedIndex].createdAt, tz)}
									</Text>
									<Text size="sm" mt="sm">
										Author:{" "}
										{revisionData[selectedIndex] && revisionData[selectedIndex].author && revisionData[selectedIndex].author[0] ? revisionData[selectedIndex].author[0].username : "Deleted"}
									</Text>
									<Text size="sm" mt="sm">
										Thumbnail:{" "}
										<Text component="span" variant="link">
											{revisionData[selectedIndex].thumbnail ? (
												<Link href={revisionData[selectedIndex].thumbnail!}>
													<a>{revisionData[selectedIndex].thumbnail}</a>
												</Link>
											) : (
												"None"
											)}
										</Text>
									</Text>
									<Text size="sm" mt="sm">
										Tags:
										<Text component="span" ml={4}>
											{revisionData[selectedIndex].tags && revisionData![selectedIndex].tags!.length > 0
												? revisionData[selectedIndex].tags?.map((tags, i) => {
														return (
															<span key={i}>
																<Link href={`../tags?qAll=${tags}`}>
																	<a>
																		<Text component="span" variant="link">
																			{tags}
																		</Text>
																	</a>
																</Link>
																{i < revisionData![selectedIndex].tags!.length - 1 ? ", " : ""}
															</span>
														);
												  })
												: "Deleted"}
										</Text>
									</Text>
									<Text size="sm" mt="sm">
										Visibility: {revisionData[selectedIndex].visibility}
									</Text>
								</Box>
							</Group>

							<Group position="center" ml="auto">
								<Divider orientation="vertical" />
							</Group>

							<Group position="right" ml="auto">
								<Box>
									<Text size="sm" mt="sm">
										Created at: {formatDateWithTz(compareData[compareIndex].createdAt, tz)}
									</Text>
									<Text size="sm" mt="sm">
										Author: {compareData[compareIndex] && compareData[compareIndex].author && compareData[compareIndex].author[0] ? compareData[compareIndex].author[0].username : "Deleted"}
									</Text>
									<Text size="sm" mt="sm">
										Thumbnail:{" "}
										<Text component="span" variant="link">
											{compareData[compareIndex].thumbnail ? (
												<Link href={compareData[compareIndex].thumbnail!}>
													<a>{compareData[compareIndex].thumbnail}</a>
												</Link>
											) : (
												"None"
											)}
										</Text>
									</Text>
									<Text size="sm" mt="sm">
										Tags:
										<Text component="span" ml={4}>
											{compareData[compareIndex].tags && revisionData![selectedIndex].tags!.length > 0
												? compareData[compareIndex].tags?.map((tags, i) => {
														return (
															<span key={i}>
																<Link href={`../tags?qAll=${tags}`}>
																	<a>
																		<Text component="span" variant="link">
																			{tags}
																		</Text>
																	</a>
																</Link>
																{i < revisionData![selectedIndex].tags!.length - 1 ? ", " : ""}
															</span>
														);
												  })
												: "Deleted"}
										</Text>
									</Text>
									<Text size="sm" mt="sm">
										Visibility: {compareData[compareIndex].visibility}
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
