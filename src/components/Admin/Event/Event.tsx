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
	MultiSelect,
} from "@mantine/core";
import { keys } from "@mantine/utils";
import { showNotification } from "@mantine/notifications";
import { openConfirmModal } from "@mantine/modals";
import { useLocalStorage } from "@mantine/hooks";
import {
	IconSearch,
	IconEdit,
	IconTrash,
	IconPin,
	IconPinnedOff,
	IconUser,
	IconLetterA,
	IconTags,
	IconDeviceWatch,
	IconRefresh,
	IconEye,
	IconHome,
	IconHomeOff,
	IconHistory,
} from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { IEventRevision, validEventSort, EventSort, EventQRes } from "../../../interfaces/db";
import { addQueryParam, removeQueryParam, SERVER_V1, formatDateWithTz } from "../../../helper";
import { Th, useTableStyles, TitleDashboard } from "../../Utils/Dashboard";

interface IEventProps extends IDashboardProps {
	revision?: boolean;
}

export const Event: NextPage<IEventProps> = (props) => {
	const { classes } = useTableStyles();
	const router = useRouter();

	const [curPage, setCurPage] = useState(1);
	const [pages, setPages] = useState(1);
	const [perPage, setPerPage] = useLocalStorage({ key: "perPage-event", defaultValue: 25 });

	const [searchAll, setSearchAll] = useState("");
	const [searchTitle, setSearchTitle] = useState("");
	const [searchVisibility, setSearchVisibility] = useState<"public" | "draft" | "private" | "all">("all");
	const [searchOrganizer, setSearchOrganizer] = useState<string[]>([]);
	const [searchTags, setSearchTags] = useState<string[]>([]);
	const [searchAuthor, setSearchAuthor] = useState("");
	const [searchIsPinned, setSearchIsPinned] = useState<"true" | "false" | "all">("all");
	const [searchShowAtHome, setSearchShowAtHome] = useState<"true" | "false" | "all">("all");
	const [searchCreatedAt, setSearchCreatedAt] = useState("");

	const [dataAllPage, setDataAllPage] = useState<IEventRevision[]>([]);
	const [dataPage, setDataPage] = useState<IEventRevision[]>([]);
	const [sortBy, setSortBy] = useState<validEventSort | null>(null);
	const [availableTags, setAvailableTags] = useState<string[]>([]);
	const [availableOrganization, setAvailableOrganization] = useState<string[]>([]);

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

	const handleSelectQueryChange = (value: string, setFunc: (value: any) => void, param: string, realValue?: any) => {
		setFunc(realValue ? realValue : value);
		if (value === "") removeQueryParam(router, param);
		else addQueryParam(router, param, value);
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
			children: <Text size="sm">Are you sure you want to delete this event? This action is irreversible, destructive, and there is no way to recover the deleted data.</Text>,
			labels: { confirm: "Yes, delete event", cancel: "No, cancel" },
			confirmProps: { color: "red" },
			onCancel: () => {},
			onConfirm: () => deleteData(id),
		});
	};

	// -----------------------------------------------------------
	// display
	const searchAllHelper = (item: IEventRevision, query: string) => {
		return (
			item.title.toLowerCase().includes(query.toLowerCase()) ||
			item.author[0]?.username.toLowerCase().includes(query.toLowerCase()) ||
			item.tags?.join(" ").toLowerCase().includes(query.toLowerCase()) ||
			item.visibility.toLowerCase().includes(query.toLowerCase()) ||
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
				searchVisibility !== "all" ||
				(searchOrganizer.length > 0 && searchOrganizer[0]) ||
				(searchTags.length > 0 && searchTags[0]) ||
				searchAuthor !== "" ||
				searchIsPinned !== "all" ||
				searchShowAtHome !== "all" ||
				searchCreatedAt !== "")
		);
	};

	const searchData = (dataPage: IEventRevision[], dataAll: IEventRevision[]) => {
		// verify searching
		if (isSearching()) dataPage = dataAll;

		if (tabIndex === 0) {
			if (searchAll !== "") dataPage = dataPage.filter((item) => keys(dataPage[0]).some(() => searchAllHelper(item, searchAll)));
		} else if (tabIndex === 1) {
			if (searchTitle !== "") dataPage = dataPage.filter((item) => item.title.toLowerCase().includes(searchTitle.toLowerCase()));
			if (searchVisibility !== "all") dataPage = dataPage.filter((item) => item.visibility.toLowerCase().includes(searchVisibility.toLowerCase()));
			if (searchOrganizer.length > 0 && searchOrganizer[0]) dataPage = dataPage.filter((item) => item.organizer?.some((org) => searchOrganizer.includes(org)));
			if (searchTags.length > 0 && searchTags[0]) dataPage = dataPage.filter((item) => item.tags?.some((tag) => searchTags.includes(tag)));
			if (searchAuthor !== "") dataPage = dataPage.filter((item) => item.author[0]?.username.toLowerCase().includes(searchAuthor.toLowerCase()));
			if (searchIsPinned !== "all") dataPage = dataPage.filter((item) => item.pinned.toString() === searchIsPinned);
			if (searchShowAtHome !== "all") dataPage = dataPage.filter((item) => item.showAtHome.toString() === searchShowAtHome);
			if (searchCreatedAt !== "") dataPage = dataPage.filter((item) => formatDateWithTz(item.createdAt, tz).toLowerCase().includes(searchCreatedAt.toLowerCase()));
		}

		return dataPage;
	};

	const sortSearchData = (type: validEventSort | null, dataPage: IEventRevision[], dataAll: IEventRevision[]) => {
		if (!type) return searchData(dataPage, dataAll);

		if (isSearching()) dataPage = dataAll.length > 0 ? dataAll : dataPage;
		const sortMap: EventSort = {
			title: (a, b) => (a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1),
			visibility: (a, b) => (a.visibility.toLowerCase() > b.visibility.toLowerCase() ? 1 : -1),
			organizer: (a, b) => (a.organizer && b.organizer && a.organizer.join(" ").toLowerCase() > b.organizer.join(" ").toLowerCase() ? 1 : -1),
			tags: (a, b) => (a.tags && b.tags && a.tags.join(" ").toLowerCase() > b.tags.join(" ").toLowerCase() ? 1 : -1),
			author: (a, b) => (a.author[0]?.username.toLowerCase() > b.author[0]?.username.toLowerCase() ? 1 : -1),
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
			const req = await fetch(`${SERVER_V1}/${props.revision ? "event/revision" : "event"}/${_id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			const { message, success }: EventQRes = await req.json();
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
			const req = await fetch(SERVER_V1 + `/${props.revision ? "event/revision" : "event"}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			const { data, message }: EventQRes = await req.json();
			if (req.status !== 200) {
				setLoadingDataAll(false);
				return showNotification({ title: "Error indexing all data for search", message, color: "red" });
			}

			// get tags
			const tagsOnly = data.reduce((acc: string[], item) => [...acc, ...(item.tags || [])], []);
			const tagsOnlyUnique = tagsOnly.filter((item, index) => tagsOnly.indexOf(item) === index);
			setAvailableTags(tagsOnlyUnique);

			// get organization
			const organizationOnly = data.reduce((acc: string[], item) => [...acc, ...(item.organizer || [])], []);
			const organizationOnlyUnique = organizationOnly.filter((item, index) => organizationOnly.indexOf(item) === index);
			setAvailableOrganization(organizationOnlyUnique);

			setDataAllPage(data);
			setLoadingDataAll(false);
		} catch (error: any) {
			setLoadingDataAll(false);
			showNotification({ title: "Error indexing all data for search", message: error.message, color: "red" });
			setAvailableTags(["Fail to load tags"]);
		}
	};

	const fillData = async (perPage: number, curPageQ: number) => {
		try {
			setLoadingDataPage(true);
			const req = await fetch(SERVER_V1 + `/${props.revision ? "event/revision" : "event"}?perPage=${perPage}&page=${curPageQ}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			const { data, message, page, pages }: EventQRes = await req.json();
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
		setSearchTitle(params.get("title") || "");
		setSearchVisibility((params.get("visibility") as any) || "all");
		setSearchOrganizer([params.get("organizer")!] || []);
		setSearchTags([params.get("tags")!] || []);
		setSearchAuthor(params.get("author") || "");
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
			<TitleDashboard
				title={`${props.revision ? "Event Posts Revision" : "Event Posts"}`}
				hrefLink={`${props.revision ? props.pathname?.split("?")[0] + "/revision" : props.pathname?.split("?")[0]}/create`}
				hrefText="Add new"
			/>
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

								<Select
									label="Visibility"
									name="visibility"
									icon={<IconEye size={14} stroke={1.5} />}
									value={searchVisibility}
									onChange={(e) => handleSelectQueryChange(e || "", setSearchVisibility, "visibility")}
									data={[
										{ value: "all", label: "All" },
										{ value: "public", label: "Public" },
										{ value: "draft", label: "Draft" },
										{ value: "private", label: "Private" },
									]}
									mt={8}
								/>

								<MultiSelect
									label="Organizer"
									name="organizer"
									placeholder="Search by organizer field"
									icon={<IconTags size={14} stroke={1.5} />}
									value={searchOrganizer}
									onChange={(e) => handleSelectQueryChange(e.join(" "), setSearchOrganizer, "organizer", e)}
									data={availableOrganization}
									mt={8}
									searchable
								/>

								<MultiSelect
									label="Tags"
									name="tags"
									placeholder="Search by tags field"
									icon={<IconTags size={14} stroke={1.5} />}
									value={searchTags}
									onChange={(e) => handleSelectQueryChange(e.join(" "), setSearchTags, "tags", e)}
									data={availableTags}
									mt={8}
									searchable
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

								<Select
									label="Is Pinned"
									name="pinned"
									icon={<IconPin size={14} stroke={1.5} />}
									value={searchIsPinned}
									onChange={(e) => handleSelectQueryChange(e || "", setSearchIsPinned, "pinned")}
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
									onChange={(e) => handleSelectQueryChange(e || "", setSearchShowAtHome, "showAtHome")}
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
									sorted={sortBy === "visibility"}
									reversed={reverseSortDirection}
									onSort={() => {
										if (sortBy === "visibility") setReverseSortDirection(!reverseSortDirection);
										setSortBy("visibility");
									}}
									width="10%"
								>
									Visibility
								</Th>
								<Th
									classes={classes}
									sorted={sortBy === "organizer"}
									reversed={reverseSortDirection}
									onSort={() => {
										if (sortBy === "organizer") setReverseSortDirection(!reverseSortDirection);
										setSortBy("organizer");
									}}
									width="12%"
								>
									Organizer
								</Th>
								<Th
									classes={classes}
									sorted={sortBy === "tags"}
									reversed={reverseSortDirection}
									onSort={() => {
										if (sortBy === "tags") setReverseSortDirection(!reverseSortDirection);
										setSortBy("tags");
									}}
									width="11%"
								>
									Tags
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
									width="12%"
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
											<Tooltip withArrow label={row.description} multiline>
												<span>
													<Link href={`/event/${row.title.replaceAll(" ", "-")}-${row._id}`}>
														<a>
															<Text component="span" variant="link">
																{row.title}
															</Text>
														</a>
													</Link>
												</span>
											</Tooltip>
										</td>
										<td>{row.visibility}</td>
										<td>
											{row.organizer && row.organizer.length > 0
												? row.organizer.map((organizer, i) => {
														return (
															<span key={i}>
																<Link href={`${props.revision ? "../event" : props.pathname?.split("?")[0]}/organizer?qAll=${organizer}`}>
																	<a>
																		<Text component="span" variant="link">
																			{organizer}
																		</Text>
																	</a>
																</Link>
																{i < row.organizer!.length - 1 ? ", " : ""}
															</span>
														);
												  })
												: "None"}
										</td>
										<td>
											{row.tags && row.tags.length > 0
												? row.tags.map((tags, i) => {
														return (
															<span key={i}>
																<Link href={`${props.revision ? "../event" : props.pathname?.split("?")[0]}/tags?qAll=${tags}`}>
																	<a>
																		<Text component="span" variant="link">
																			{tags}
																		</Text>
																	</a>
																</Link>
																{i < row.tags!.length - 1 ? ", " : ""}
															</span>
														);
												  })
												: "Deleted"}
										</td>
										<td>
											{row.editedBy && row.editedBy[0] ? (
												<>
													<Tooltip withArrow label={`Last edited by: ${row.editedBy[0].username}`}>
														<span>{row.author[0] ? row.author[0].username : "Deleted"}</span>
													</Tooltip>
												</>
											) : row.author[0] ? (
												row.author[0].username
											) : (
												"Deleted"
											)}
										</td>
										<td>
											{row.pinned ? (
												<Tooltip withArrow label="Pinned">
													<span>
														<IconPin />
													</span>
												</Tooltip>
											) : (
												<Tooltip withArrow label="Not pinned">
													<span>
														<IconPinnedOff />
													</span>
												</Tooltip>
											)}
										</td>
										<td>
											{row.showAtHome ? (
												<Tooltip withArrow label="Shown at home">
													<span>
														<IconHome />
													</span>
												</Tooltip>
											) : (
												<Tooltip withArrow label="Not shown at home">
													<span>
														<IconHomeOff />
													</span>
												</Tooltip>
											)}
										</td>
										<td>
											{row.updatedAt !== row.createdAt ? (
												<Tooltip withArrow label={`Last edited at: ${formatDateWithTz(row.updatedAt, tz)}`}>
													<span>{formatDateWithTz(row.createdAt, tz)}</span>
												</Tooltip>
											) : (
												<>{formatDateWithTz(row.createdAt, tz)}</>
											)}
										</td>
										<td style={{ padding: "1rem .5rem" }}>
											<div className="dash-flex">
												{!props.revision && (
													<>
														<Tooltip withArrow label="Edit">
															<span>
																<Link href={`${props.pathname?.split("?")[0]}/${row._id}`}>
																	<a>
																		<ActionIcon>
																			<IconEdit size={14} stroke={1.5} />
																		</ActionIcon>
																	</a>
																</Link>
															</span>
														</Tooltip>
														<Tooltip withArrow label="View revisions">
															<span>
																<Link href={`${props.pathname?.split("?")[0]}/${row._id}/revision`}>
																	<a>
																		<ActionIcon>
																			<IconHistory size={14} stroke={1.5} />
																		</ActionIcon>
																	</a>
																</Link>
															</span>
														</Tooltip>
													</>
												)}
												<Tooltip withArrow label="Delete">
													<span>
														<ActionIcon onClick={() => handleDelete(row._id)}>
															<IconTrash size={14} stroke={1.5} />
														</ActionIcon>
													</span>
												</Tooltip>
											</div>
										</td>
									</tr>
								))
							) : (
								<>
									<tr>
										<td colSpan={8}>
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
