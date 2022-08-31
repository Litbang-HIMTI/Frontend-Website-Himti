import type { NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UnstyledButton, Group, Text, TextInput, Tooltip, ActionIcon, Tabs, Collapse, NumberInput, Select } from "@mantine/core";
import { keys } from "@mantine/utils";
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
	IconNumber9,
	IconHome,
	IconHomeOff,
} from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { IForum, validForumSort, ForumSort } from "../../../interfaces/db";
import { actionPrompt, fillDataPage, fillDataAll, handleAdminTabChange, handleInputQueryChange, handleNumInputChange, handleSelectQueryChange } from "../../../helper/admin";
import { formatDateWithTz } from "../../../helper/global";
import { Th, useTableStyles } from "../../Utils/Dashboard";
import { TableView } from "../Reusable/TableView";

export const Forum: NextPage<IDashboardProps> = (props) => {
	const { classes } = useTableStyles();
	const router = useRouter();
	const api_url = "forum";

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
	const handleDelete = (id: string) => actionPrompt({ context: "forum post", _id: id, api_url, setDataPage, setDataAllPage });
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
	const fetchUrlParams = () => {
		const { query } = router;
		const params = new URLSearchParams(query as unknown as string);
		// set to local state
		setCurPage(params.get("page") ? parseInt(params.get("page") || "1") : 1);
		setSearchAll(params.get("qAll") || "");
		setSearchTitle(params.get("title") || "");
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
		fillDataPage(api_url, perPage, curPage, setLoadingDataPage, setCurPage, setPages, setDataPage);
		fillDataAll(api_url, setLoadingDataAll, setDataAllPage);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<TableView
				{...props}
				api_url={api_url}
				title={"Forum Posts"}
				isSearching={isSearching()}
				router={router} // loading
				loadingDataAll={loadingDataAll}
				loadingDataPage={loadingDataPage}
				setLoadingDataAll={setLoadingDataAll}
				setLoadingDataPage={setLoadingDataPage} // page
				pages={pages}
				curPage={curPage}
				perPage={perPage}
				setCurPage={setCurPage}
				setPerPage={setPerPage}
				setPages={setPages} // data
				setDataPage={setDataPage}
				setDataAllPage={setDataAllPage} // tabs
				tabIndex={tabIndex}
				handle_tabs_change={(val) => handleAdminTabChange(val, setTabIndex, router)}
				tabs_header_length={2}
				tabs_element_header={() => (
					<>
						<Tabs.Tab value="0" color="green">
							Search
						</Tabs.Tab>
						<Tabs.Tab value="1" color="lime">
							Advanced Search
						</Tabs.Tab>
					</>
				)}
				tabs_element_body={() => (
					<>
						<Tabs.Panel value="0" pt="xs">
							<Collapse in={tabIndex === 0}>
								<Text color="dimmed">Quick search by any field</Text>
								<TextInput
									placeholder="Search by any field"
									name="qAll"
									mb="md"
									icon={<IconSearch size={14} stroke={1.5} />}
									value={searchAll}
									onChange={(e) => handleInputQueryChange(e, setSearchAll, e.target.name, router)}
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
									onChange={(e) => handleInputQueryChange(e, setSearchTitle, e.target.name, router)}
									mt={16}
								/>
								<TextInput
									placeholder="Search by category field"
									name="category"
									label="Category"
									icon={<IconId size={14} stroke={1.5} />}
									value={searchCategory}
									onChange={(e) => handleInputQueryChange(e, setSearchCategory, e.target.name, router)}
									mt={8}
								/>

								<TextInput
									placeholder="Search by author field"
									name="author"
									label="Author"
									icon={<IconUser size={14} stroke={1.5} />}
									value={searchAuthor}
									onChange={(e) => handleInputQueryChange(e, setSearchAuthor, e.target.name, router)}
									mt={8}
								/>
								<NumberInput
									placeholder="Search by total comments field"
									name="comments"
									label="Comments"
									icon={<IconNumber9 size={14} stroke={1.5} />}
									value={parseInt(searchCommentCount) ? parseInt(searchCommentCount) : undefined}
									onChange={(value) => handleNumInputChange(value, setSearchCommentCount, "comments", router)}
									mt={8}
									min={0}
								/>
								<Select
									label="Is Locked"
									name="locked"
									icon={<IconLock size={14} stroke={1.5} />}
									value={searchIsLocked}
									onChange={(e) => handleSelectQueryChange(e ? e : "", setSearchIsLocked, "locked", router)}
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
									onChange={(e) => handleSelectQueryChange(e ? e : "", setSearchIsLocked, "pinned", router)}
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
									onChange={(e) => handleSelectQueryChange(e ? e : "", setSearchIsLocked, "showAtHome", router)}
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
									onChange={(e) => handleInputQueryChange(e, setSearchCreatedAt, e.target.name, router)}
									mt={8}
								/>
							</Collapse>
						</Tabs.Panel>
					</>
				)} // table
				th_element={() => (
					<>
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
					</>
				)}
				tr_element={() => (
					<>
						{dataPage && dataPage.length > 0 && sortSearchData(sortBy, dataPage, dataAllPage).length > 0 ? (
							sortSearchData(sortBy, dataPage, dataAllPage).map((row) => (
								<tr key={row._id}>
									<td>
										<Link href={`/forum/${row.title.replaceAll(" ", "-")}-${row._id}`}>
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
					</>
				)}
			/>
		</>
	);
};
