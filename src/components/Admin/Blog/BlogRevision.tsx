import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { showNotification } from "@mantine/notifications";
import { Box, Button, Group, LoadingOverlay, Text, Select, useMantineColorScheme, Center, List, Grid } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { actionPrompt, formatDateWithTz, SERVER_V1 } from "../../../helper";
import { IBlog, IBlogRevision } from "../../../interfaces/db";
import { TitleDashboard } from "../../Utils/Dashboard";
import ReactDiffViewer from "react-diff-viewer";
import Link from "next/link";

interface IBlogRevisionProps extends IDashboardProps {
	blog?: IBlog;
	blogRevision?: IBlogRevision[];
}

export const BlogRevision: NextPage<IBlogRevisionProps> = (props) => {
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
	const handleReplace = () =>
		actionPrompt({
			isGeneric: true,
			genericMsg: "restore this revision? This action is irreversible, but don't worry the current post will be available in post revision.",
			customCallback: restoreForm,
		});
	const handleDelete = () => actionPrompt({ context: "revision", customCallback: deleteForm });

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
							label: `Revision ${revision.revision} - ${formatDateWithTz(revision.createdAt, Intl.DateTimeFormat().resolvedOptions().timeZone)}`,
							value: index.toString(),
						};
				  })
				: [{ label: "No Revision", value: "null" }]
		);
		setCompareSelect(
			[props.blog!, ...props.blogRevision!].map((revision: IBlogRevision, index) => {
				return {
					label: `${revision.revision ? `Revision ${revision.revision}` : "Current Post"} - ${formatDateWithTz(revision.createdAt, Intl.DateTimeFormat().resolvedOptions().timeZone)}`,
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

				{props.blog && revisionData && compareData && revisionData.length > 0 ? (
					<Box mt="md">
						<ReactDiffViewer
							useDarkTheme={colorScheme === "dark"}
							oldValue={revisionData[selectedIndex].content}
							leftTitle={`Revision${revisionData[selectedIndex].revision}\nTitle: ` + revisionData[selectedIndex].title + "\n\nDescription:\n" + revisionData[selectedIndex].description}
							newValue={compareData[compareIndex].content}
							rightTitle={
								`${compareData[compareIndex].revision ? `Revision ${compareData[compareIndex].revision}` : `Current`}\nTitle: ` +
								compareData[compareIndex]?.title +
								"\n\nDescription:\n" +
								compareData[compareIndex]?.description
							}
							splitView={true}
						/>

						<Grid mt="md" grow>
							<Grid.Col span={4}>
								<List spacing="sm">
									<List.Item>Created at: {formatDateWithTz(revisionData[selectedIndex].createdAt, tz)}</List.Item>
									<List.Item>
										Author:{" "}
										{revisionData[selectedIndex] && revisionData[selectedIndex].author && revisionData[selectedIndex].author[0] ? revisionData[selectedIndex].author[0].username : "Deleted"}
									</List.Item>
									<List.Item>
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
									</List.Item>
									<List.Item>
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
									</List.Item>
									<List.Item>Visibility: {revisionData[selectedIndex].visibility}</List.Item>
								</List>
							</Grid.Col>

							<Grid.Col span={4}>
								<List spacing="sm">
									<List.Item>Created at: {formatDateWithTz(compareData[compareIndex].createdAt, tz)}</List.Item>
									<List.Item>
										Author: {compareData[compareIndex] && compareData[compareIndex].author && compareData[compareIndex].author[0] ? compareData[compareIndex].author[0].username : "Deleted"}
									</List.Item>
									<List.Item>
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
									</List.Item>
									<List.Item>
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
									</List.Item>
									<List.Item>Visibility: {compareData[compareIndex].visibility}</List.Item>
								</List>
							</Grid.Col>
						</Grid>
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
