import type { NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
	Table,
	ScrollArea,
	UnstyledButton,
	Group,
	Text,
	Center,
	TextInput,
	Tooltip,
	ActionIcon,
	Tabs,
	Button,
	LoadingOverlay,
	Divider,
	Collapse,
	NumberInput,
	TabsValue,
	Pagination,
	Select,
} from "@mantine/core";
import { keys } from "@mantine/utils";
import { showNotification } from "@mantine/notifications";
import { openConfirmModal } from "@mantine/modals";
import { useLocalStorage } from "@mantine/hooks";
import {
	IconSearch,
	IconEdit,
	IconTrash,
	IconLock,
	IconLockOpen,
	IconPin,
	IconPinnedOff,
	IconUser,
	IconLetterA,
	IconId,
	IconDeviceWatch,
	IconRefresh,
	IconNumber9,
	IconHome,
	IconHomeOff,
} from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { IForum, validForumSort, ForumSort, ForumQRes } from "../../../interfaces/db";
import { addQueryParam, removeQueryParam, SERVER_V1, formatDateWithTz } from "../../../helper";
import { Th, useTableStyles, TitleDashboard } from "../../Utils/Dashboard";

export const Forum: NextPage<IDashboardProps> = (props) => {
	const { classes } = useTableStyles();
	const router = useRouter();

	const [curPage, setCurPage] = useState(1);
	const [pages, setPages] = useState(1);
	const [perPage, setPerPage] = useLocalStorage({ key: "perPage-forum", defaultValue: 25 });

	const [searchAll, setSearchAll] = useState("");
	const [searchTitle, setSearchTitle] = useState("");
	const [searchCategory, setSearchCategory] = useState("");
	const [searchAuthor, setSearchAuthor] = useState("");
	const [searchCommentCount, setSearchCommentCount] = useState("");
	const [searchIsLocked, setSearchIsLocked] = useState<"true" | "false" | "all">("all");
	const [searchIsPinned, setSearchIsPinned] = useState<"true" | "false" | "all">("all");
	const [searchShowAtHome, setSearchShowAtHome] = useState<"true" | "false" | "all">("all");
	const [searchCreatedAt, setSearchCreatedAt] = useState("");

	const [dataAllPage, setDataAllPage] = useState<IForum[]>([]);
	const [dataPage, setDataPage] = useState<IForum[]>([]);
	const [sortBy, setSortBy] = useState<validForumSort | null>(null);

	const [reverseSortDirection, setReverseSortDirection] = useState(false);
	const [loadingDataPage, setLoadingDataPage] = useState(true);
	const [loadingDataAll, setLoadingDataAll] = useState(true);
	const [tabIndex, setTabIndex] = useState(0);

	const [tz, setTz] = useState("UTC");

	// -----------------------------------------------------------
	// handler
	const handleInputQueryChange = (e: React.ChangeEvent<HTMLInputElement>, setFunc: (value: string) => void, param: string) => {
		setFunc(e.target.value);
		if (e.target.value === "") removeQueryParam(router, param);
		else addQueryParam(router, param, e.target.value);
	};

	const handleTabChange = (index: TabsValue) => {
		setTabIndex(index ? parseInt(index) : 0);
		addQueryParam(router, "tab", index ? index : "0");
	};

	const pageChange = (page: number) => {
		setCurPage(page);
		addQueryParam(router, "page", page.toString());
		fillData(perPage, page);
	};

	const handleDelete = (id: string) => {
		openConfirmModal({
			title: "Delete confirmation",
			children: <Text size="sm">Are you sure you want to delete this forum post? This action is irreversible, destructive, and there is no way to recover the deleted data.</Text>,
			labels: { confirm: "Yes, delete forum post", cancel: "No, cancel" },
			confirmProps: { color: "red" },
			onCancel: () => {},
			onConfirm: () => deleteData(id),
		});
	};

	// -----------------------------------------------------------
	// display
	const searchAllHelper = (item: IForum, query: string) => {
		return (
			item.title.toLowerCase().includes(query.toLowerCase()) ||
			item.author[0]?.username.toLowerCase().includes(query.toLowerCase()) ||
			item.category[0].name.toLowerCase().includes(query.toLowerCase()) ||
			formatDateWithTz(item.createdAt, tz).toLowerCase().includes(query.toLowerCase())
		);
	};

	const isSearching = () => {
		// not on setting page and is actually searching and data all is fetched
		return (
			tabIndex !== 2 &&
			dataAllPage.length > 0 &&
			(searchAll !== "" ||
				searchTitle !== "" ||
				searchCategory !== "" ||
				searchAuthor !== "" ||
				searchCommentCount !== "" ||
				searchIsLocked !== "all" ||
				searchIsPinned !== "all" ||
				searchShowAtHome !== "all" ||
				searchCreatedAt !== "")
		);
	};

	const searchData = (dataPage: IForum[], dataAll: IForum[]) => {
		// verify searching
		if (isSearching()) dataPage = dataAll;

		if (tabIndex === 0) {
			if (searchAll !== "") dataPage = dataPage.filter((item) => keys(dataPage[0]).some(() => searchAllHelper(item, searchAll)));
		} else if (tabIndex === 1) {
			if (searchTitle !== "") dataPage = dataPage.filter((item) => item.title.toLowerCase().includes(searchTitle.toLowerCase()));
			if (searchCategory !== "") dataPage = dataPage.filter((item) => item.category[0].name.toLowerCase().includes(searchCategory.toLowerCase()));
			if (searchAuthor !== "") dataPage = dataPage.filter((item) => item.author[0].username.toLowerCase().includes(searchAuthor.toLowerCase()));
			if (searchCommentCount !== "") dataPage = dataPage.filter((item) => item.commentCount.toString() === searchCommentCount);
			if (searchIsLocked !== "all") dataPage = dataPage.filter((item) => item.locked.toString() === searchIsLocked);
			if (searchIsPinned !== "all") dataPage = dataPage.filter((item) => item.pinned.toString() === searchIsPinned);
			if (searchShowAtHome !== "all") dataPage = dataPage.filter((item) => item.showAtHome.toString() === searchShowAtHome);
			if (searchCreatedAt !== "") dataPage = dataPage.filter((item) => formatDateWithTz(item.createdAt, tz).toLowerCase().includes(searchCreatedAt.toLowerCase()));
		}

		return dataPage;
	};

	const sortSearchData = (type: validForumSort | null, dataPage: IForum[], dataAll: IForum[]) => {
		if (!type) return searchData(dataPage, dataAll);

		if (isSearching()) dataPage = dataAll.length > 0 ? dataAll : dataPage;
		const sortMap: ForumSort = {
			title: (a, b) => (a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1),
			category: (a, b) => (a.category[0].name.toLowerCase() > b.category[0].name.toLowerCase() ? 1 : -1),
			author: (a, b) => (a.author[0].username.toLowerCase() > b.author[0].username.toLowerCase() ? 1 : -1),
			commentCount: (a, b) => (a.commentCount > b.commentCount ? 1 : -1),
			locked: (a, b) => (a.locked > b.locked ? 1 : -1),
			pinned: (a, b) => (a.pinned > b.pinned ? 1 : -1),
			showAtHome: (a, b) => (a.showAtHome > b.showAtHome ? 1 : -1),
			createdAt: (a, b) => (a.createdAt > b.createdAt ? 1 : -1),
		};

		// sort
		let sortedData = dataPage.sort(sortMap[type]);
		if (reverseSortDirection) sortedData.reverse();

		return searchData(sortedData, dataAll);
	};

	// -----------------------------------------------------------
	// delete
	const deleteData = async (_id: string) => {
		try {
			const req = await fetch(`${SERVER_V1}/forum/${_id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			const { message, success }: ForumQRes = await req.json();
			if (req.status === 200 && success) {
				// slice data
				setDataPage((prev) => {
					return prev.filter((item) => item._id !== _id);
				});
				setDataAllPage((prev) => {
					return prev.filter((item) => item._id !== _id);
				});

				showNotification({ title: "Success", message });
			} else {
				showNotification({ title: "Error", message, color: "red" });
			}
		} catch (error: any) {
			showNotification({ title: "Error", message: error.message, color: "red" });
		}
	};

	// fetch
	const fillDataAll = async () => {
		try {
			setLoadingDataAll(true);
			const req = await fetch(SERVER_V1 + `/forum`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			const { data, message }: ForumQRes = await req.json();
			if (req.status !== 200) {
				setLoadingDataAll(false);
				return showNotification({ title: "Error indexing all data for search", message, color: "red" });
			}

			setDataAllPage(data);
			setLoadingDataAll(false);
		} catch (error: any) {
			setLoadingDataAll(false);
			showNotification({ title: "Error indexing all data for search", message: error.message, color: "red" });
		}
	};

	const fillData = async (perPage: number, curPageQ: number) => {
		try {
			setLoadingDataPage(true);
			const req = await fetch(SERVER_V1 + `/forum?perPage=${perPage}&page=${curPageQ}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			const { data, message, page, pages }: ForumQRes = await req.json();
			if (req.status !== 200) {
				setLoadingDataPage(false);
				return showNotification({ title: "Error getting page data", message, color: "red" });
			}

			setCurPage(page);
			setPages(pages ? pages : 1);
			setDataPage(data);
			setLoadingDataPage(false);
		} catch (error: any) {
			setLoadingDataPage(false);
			showNotification({ title: "Error getting page data", message: error.message, color: "red" });
		}
	};

	const fetchUrlParams = () => {
		const { query } = router;
		const params = new URLSearchParams(query as unknown as string);
		// set to local state
		setCurPage(params.get("page") ? parseInt(params.get("page") || "1") : 1);
		setSearchAll(params.get("qAll") || "");
		setSearchTitle(params.get("username") || "");
		setSearchCategory(params.get("category") || "");
		setSearchAuthor(params.get("author") || "");
		setSearchCommentCount(params.get("commentCount") || "");
		setSearchIsLocked((params.get("locked") as any) || "all");
		setSearchIsPinned((params.get("pinned") as any) || "all");
		setSearchShowAtHome((params.get("showAtHome") as any) || "all");
		setSearchCreatedAt(params.get("createdAt") || "");
		setTabIndex(parseInt(params.get("tab") || "0"));
	};

	useEffect(() => {
		fetchUrlParams();
		setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
		fillData(perPage, curPage);
		fillDataAll();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<TitleDashboard title="User" hrefLink={`${props.pathname?.split("?")[0]}/create`} hrefText="Add new" />
			<div>
				<Tabs value={tabIndex.toString() || "0"} onTabChange={handleTabChange}>
					<Tabs.List>
						<Tabs.Tab value="0" color="green">
							Search
						</Tabs.Tab>
						<Tabs.Tab value="1" color="lime">
							Advanced Search
						</Tabs.Tab>
						<Tabs.Tab value="2" color="blue">
							Setting
						</Tabs.Tab>
					</Tabs.List>

					<div className="dash-relative">
						<LoadingOverlay visible={loadingDataAll} overlayBlur={3} />
						<Tabs.Panel value="0" pt="xs">
							<Collapse in={tabIndex === 0}>
								<Text color="dimmed">Quick search by any field</Text>
								<TextInput
									placeholder="Search by any field"
									name="qAll"
									mb="md"
									icon={<IconSearch size={14} stroke={1.5} />}
									value={searchAll}
									onChange={(e) => handleInputQueryChange(e, setSearchAll, e.target.name)}
									mt={16}
								/>
							</Collapse>
						</Tabs.Panel>

						<Tabs.Panel value="1" pt="xs" className="dash-textinput-gap">
							<Collapse in={tabIndex === 1}>
								<Text color="dimmed">Search more accurately by searching for each field</Text>

								<TextInput
									placeholder="Search by title field"
									name="title"
									label="Title"
									icon={<IconLetterA size={14} stroke={1.5} />}
									value={searchTitle}
									onChange={(e) => handleInputQueryChange(e, setSearchTitle, e.target.name)}
									mt={16}
								/>
								<TextInput
									placeholder="Search by category field"
									name="category"
									label="Category"
									icon={<IconId size={14} stroke={1.5} />}
									value={searchCategory}
									onChange={(e) => handleInputQueryChange(e, setSearchCategory, e.target.name)}
									mt={8}
								/>

								<TextInput
									placeholder="Search by author field"
									name="author"
									label="Author"
									icon={<IconUser size={14} stroke={1.5} />}
									value={searchAuthor}
									onChange={(e) => handleInputQueryChange(e, setSearchAuthor, e.target.name)}
									mt={8}
								/>
								<NumberInput
									placeholder="Search by total comments field"
									name="comments"
									label="Comments"
									icon={<IconNumber9 size={14} stroke={1.5} />}
									value={parseInt(searchCommentCount) ? parseInt(searchCommentCount) : undefined}
									onChange={(value) => {
										if (!value) {
											setSearchCommentCount("");
											removeQueryParam(router, "comments");
										} else {
											setSearchCommentCount(value.toString());
											addQueryParam(router, "comments", value.toString());
										}
									}}
									mt={8}
									min={0}
								/>
								<Select
									label="Is Locked"
									name="locked"
									icon={<IconLock size={14} stroke={1.5} />}
									value={searchIsLocked}
									onChange={(e) => {
										setSearchIsLocked(e as any);
										addQueryParam(router, "locked", e as any);
									}}
									data={[
										{ value: "all", label: "All" },
										{ value: "true", label: "True" },
										{ value: "false", label: "False" },
									]}
									mt={8}
								/>
								<Select
									label="Is Pinned"
									name="pinned"
									icon={<IconPin size={14} stroke={1.5} />}
									value={searchIsPinned}
									onChange={(e) => {
										setSearchIsPinned(e as any);
										addQueryParam(router, "pinned", e as any);
									}}
									data={[
										{ value: "all", label: "All" },
										{ value: "true", label: "True" },
										{ value: "false", label: "False" },
									]}
									mt={8}
								/>
								<Select
									label="Show at home"
									name="showAtHome"
									icon={<IconHome size={14} stroke={1.5} />}
									value={searchShowAtHome}
									onChange={(e) => {
										setSearchShowAtHome(e as any);
										addQueryParam(router, "showAtHome", e as any);
									}}
									data={[
										{ value: "all", label: "All" },
										{ value: "true", label: "True" },
										{ value: "false", label: "False" },
									]}
									mt={8}
								/>
								<TextInput
									placeholder="Search by createdAt field"
									label="Created At"
									name="createdAt"
									icon={<IconDeviceWatch size={14} stroke={1.5} />}
									value={searchCreatedAt}
									onChange={(e) => handleInputQueryChange(e, setSearchCreatedAt, e.target.name)}
									mt={8}
								/>
							</Collapse>
						</Tabs.Panel>
					</div>
					<Tabs.Panel value="2" pt="xs" className="dash-textinput-gap">
						<Collapse in={tabIndex === 2}>
							<Text color="dimmed">Customize data load setting</Text>

							<NumberInput
								label="Item per page"
								placeholder="Item per page"
								description="How many item per page in the dashboard (default: 25, min: 5, max: 100). Search is not affected by this setting."
								value={perPage}
								stepHoldDelay={500}
								stepHoldInterval={100}
								min={5}
								max={100}
								onChange={(value) => {
									if (!value) return;
									setPerPage(value);
								}}
								mt={8}
							/>

							<Button
								compact
								leftIcon={<IconRefresh size={20} />}
								onClick={() => {
									fillData(perPage, curPage);
									fillDataAll();
								}}
								mt={16}
							>
								Reload the table
							</Button>
						</Collapse>
					</Tabs.Panel>
				</Tabs>
			</div>
			<Divider mt={16} mb={16} />
			<div className="dash-relative">
				<LoadingOverlay visible={loadingDataPage} overlayBlur={3} />
				<ScrollArea mt={30}>
					<Table horizontalSpacing="md" verticalSpacing="xs" sx={{ tableLayout: "fixed", width: "100%" }} highlightOnHover>
						<thead>
							<tr>
								<Th
									classes={classes}
									sorted={sortBy === "title"}
									reversed={reverseSortDirection}
									onSort={() => {
										if (sortBy === "title") setReverseSortDirection(!reverseSortDirection);
										setSortBy("title");
									}}
									width="15%"
								>
									Title
								</Th>
								<Th
									classes={classes}
									sorted={sortBy === "category"}
									reversed={reverseSortDirection}
									onSort={() => {
										if (sortBy === "category") setReverseSortDirection(!reverseSortDirection);
										setSortBy("category");
									}}
									width="15%"
								>
									Category
								</Th>
								<Th
									classes={classes}
									sorted={sortBy === "author"}
									reversed={reverseSortDirection}
									onSort={() => {
										if (sortBy === "author") setReverseSortDirection(!reverseSortDirection);
										setSortBy("author");
									}}
									width="10%"
								>
									Author
								</Th>
								<Th
									classes={classes}
									sorted={sortBy === "commentCount"}
									reversed={reverseSortDirection}
									onSort={() => {
										if (sortBy === "commentCount") setReverseSortDirection(!reverseSortDirection);
										setSortBy("commentCount");
									}}
									width="10%"
								>
									Comments
								</Th>
								<Th
									classes={classes}
									sorted={sortBy === "locked"}
									reversed={reverseSortDirection}
									onSort={() => {
										if (sortBy === "locked") setReverseSortDirection(!reverseSortDirection);
										setSortBy("locked");
									}}
									width="10%"
								>
									Locked
								</Th>
								<Th
									classes={classes}
									sorted={sortBy === "pinned"}
									reversed={reverseSortDirection}
									onSort={() => {
										if (sortBy === "pinned") setReverseSortDirection(!reverseSortDirection);
										setSortBy("pinned");
									}}
									width="10%"
								>
									Pinned
								</Th>
								<Th
									classes={classes}
									sorted={sortBy === "showAtHome"}
									reversed={reverseSortDirection}
									onSort={() => {
										if (sortBy === "showAtHome") setReverseSortDirection(!reverseSortDirection);
										setSortBy("showAtHome");
									}}
									width="10%"
								>
									Show at home
								</Th>
								<Th
									classes={classes}
									sorted={sortBy === "createdAt"}
									reversed={reverseSortDirection}
									onSort={() => {
										if (sortBy === "createdAt") setReverseSortDirection(!reverseSortDirection);
										setSortBy("createdAt");
									}}
									width="10%"
								>
									Created At
								</Th>
								<th className={classes.th} style={{ width: "10%" }}>
									<UnstyledButton className={classes.control}>
										<Group position="apart">
											<Text weight={500} size="sm">
												Action
											</Text>
										</Group>
									</UnstyledButton>
								</th>
							</tr>
						</thead>
						<tbody>
							{dataPage && dataPage.length > 0 && sortSearchData(sortBy, dataPage, dataAllPage).length > 0 ? (
								sortSearchData(sortBy, dataPage, dataAllPage).map((row) => (
									<tr key={row._id}>
										<td>
											<Link href={`/forum/${row.title}-${row._id}`}>
												<a>
													<Text component="span" variant="link">
														{row.title}
													</Text>
												</a>
											</Link>
										</td>
										<td>
											{row.category && row.category.length > 0
												? row.category.map((category, i) => {
														return (
															<Tooltip label={category.description} key={i}>
																<span>
																	<Link href={`${props.pathname?.split("?")[0]}/category?qAll=${category.name}`}>
																		<a>
																			<Text component="span" variant="link">
																				{category.name}
																			</Text>
																		</a>
																	</Link>
																	{i < row.category!.length - 1 ? ", " : ""}
																</span>
															</Tooltip>
														);
												  })
												: "Deleted"}
										</td>
										<td>
											{row.editedBy && row.editedBy[0] ? (
												<>
													<Tooltip label={`Last edited by: ${row.editedBy[0].username}`}>
														<span>{row.author[0] ? row.author[0].username : "Deleted"}</span>
													</Tooltip>
												</>
											) : row.author[0] ? (
												row.author[0].username
											) : (
												"Deleted"
											)}
										</td>
										<td>{row.commentCount}</td>
										<td>
											{row.locked ? (
												<Tooltip label="Locked">
													<span>
														<IconLock />
													</span>
												</Tooltip>
											) : (
												<Tooltip label="Not locked">
													<span>
														<IconLockOpen />
													</span>
												</Tooltip>
											)}
										</td>
										<td>
											{row.pinned ? (
												<Tooltip label="Pinned">
													<span>
														<IconPin />
													</span>
												</Tooltip>
											) : (
												<Tooltip label="Not pinned">
													<span>
														<IconPinnedOff />
													</span>
												</Tooltip>
											)}
										</td>
										<td>
											{row.showAtHome ? (
												<Tooltip label="Shown at home">
													<span>
														<IconHome />
													</span>
												</Tooltip>
											) : (
												<Tooltip label="Not shown at home">
													<span>
														<IconHomeOff />
													</span>
												</Tooltip>
											)}
										</td>
										<td>
											{row.updatedAt !== row.createdAt ? (
												<Tooltip label={`Last edited at: ${formatDateWithTz(row.updatedAt, tz)}`}>
													<span>{formatDateWithTz(row.createdAt, tz)}</span>
												</Tooltip>
											) : (
												<>{formatDateWithTz(row.createdAt, tz)}</>
											)}
										</td>
										<td style={{ padding: "1rem .5rem" }}>
											<div className="dash-flex">
												<Link href={`${props.pathname?.split("?")[0]}/${row._id}`}>
													<a>
														<ActionIcon>
															<IconEdit size={14} stroke={1.5} />
														</ActionIcon>
													</a>
												</Link>
												<ActionIcon onClick={() => handleDelete(row._id)}>
													<IconTrash size={14} stroke={1.5} />
												</ActionIcon>
											</div>
										</td>
									</tr>
								))
							) : (
								<>
									<tr>
										<td colSpan={9}>
											<Text weight={500} align="center">
												Nothing found
											</Text>
										</td>
									</tr>
								</>
							)}
						</tbody>
					</Table>
				</ScrollArea>
			</div>
			<Center mt={16}>{!isSearching() && <Pagination total={pages} page={curPage} onChange={pageChange} />}</Center>
		</>
	);
};
