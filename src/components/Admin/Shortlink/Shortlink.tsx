import type { NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UnstyledButton, Group, Text, TextInput, Tooltip, ActionIcon, Tabs, Collapse, NumberInput } from "@mantine/core";
import { keys } from "@mantine/utils";
import { useLocalStorage } from "@mantine/hooks";
import { IconSearch, IconEdit, IconTrash, IconLego, IconLink, IconExternalLink, IconDeviceWatch, IconNumber9 } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { IShortlink, validShortlinkSort, ShortlinkSort } from "../../../interfaces/db";
import { actionPrompt, fillDataPage, fillDataAll, handleAdminTabChange, handleInputQueryChange } from "../../../helper/admin";
import { formatDateWithTz, addQueryParam, removeQueryParam } from "../../../helper/global";
import { Th, useTableStyles } from "../../Utils/Dashboard";
import { TableView } from "../Reusable/TableView";

export const Shortlink: NextPage<IDashboardProps> = (props) => {
	const { classes } = useTableStyles();
	const router = useRouter();
	const api_url = "shortlink";

	const [curPage, setCurPage] = useState(1);
	const [pages, setPages] = useState(1);
	const [perPage, setPerPage] = useLocalStorage({ key: "perPage-shortlink", defaultValue: 25 });

	const [searchAll, setSearchAll] = useState("");
	const [searchShorten, setSearchShorten] = useState("");
	const [searchUrl, setSearchUrl] = useState("");
	const [searchClickCount, setSearchClickCount] = useState("");
	const [searchAuthor, setSearchAuthor] = useState("");
	const [searchCreatedAt, setSearchCreatedAt] = useState("");

	const [dataAllPage, setDataAllPage] = useState<IShortlink[]>([]);
	const [dataPage, setDataPage] = useState<IShortlink[]>([]);
	const [sortBy, setSortBy] = useState<validShortlinkSort | null>(null);

	const [reverseSortDirection, setReverseSortDirection] = useState(false);
	const [loadingDataPage, setLoadingDataPage] = useState(true);
	const [loadingDataAll, setLoadingDataAll] = useState(true);
	const [tabIndex, setTabIndex] = useState(0);

	const [tz, setTz] = useState("UTC");

	// -----------------------------------------------------------
	// handler
	const handleDelete = (id: string) => actionPrompt({ context: "shorten link", _id: id, api_url, setDataPage, setDataAllPage });
	// -----------------------------------------------------------
	// display
	const searchAllHelper = (item: IShortlink, query: string) => {
		return (
			item.shorten.toLowerCase().includes(query.toLowerCase()) ||
			item.url.toLowerCase().includes(query.toLowerCase()) ||
			item.clickCount.toString().includes(query) ||
			item.author[0]?.username.toLowerCase().includes(query.toLowerCase()) ||
			formatDateWithTz(item.createdAt, tz).toLowerCase().includes(query.toLowerCase())
		);
	};

	const isSearching = () => {
		// not on setting page and is actually searching and data all is fetched
		return (
			tabIndex !== 2 && dataAllPage.length > 0 && (searchAll !== "" || searchShorten !== "" || searchUrl !== "" || searchAuthor !== "" || searchClickCount !== "" || searchCreatedAt !== "")
		);
	};

	const searchData = (dataPage: IShortlink[], dataAll: IShortlink[]) => {
		// verify searching
		if (isSearching()) dataPage = dataAll;

		if (tabIndex === 0) {
			if (searchAll !== "") dataPage = dataPage.filter((item) => keys(dataPage[0]).some(() => searchAllHelper(item, searchAll)));
		} else if (tabIndex === 1) {
			if (searchShorten !== "") dataPage = dataPage.filter((item) => item.shorten.toLowerCase().includes(searchShorten.toLowerCase()));
			if (searchUrl !== "") dataPage = dataPage.filter((item) => item.url.toLowerCase().includes(searchUrl.toLowerCase()));
			if (searchClickCount !== "") dataPage = dataPage.filter((item) => item.clickCount.toString().includes(searchClickCount));
			if (searchAuthor !== "") dataPage = dataPage.filter((item) => item.author[0]?.username.toLowerCase().includes(searchAuthor.toLowerCase()));
			if (searchCreatedAt !== "") dataPage = dataPage.filter((item) => formatDateWithTz(item.createdAt, tz).toLowerCase().includes(searchCreatedAt.toLowerCase()));
		}

		return dataPage;
	};

	const sortSearchData = (type: validShortlinkSort | null, dataPage: IShortlink[], dataAll: IShortlink[]) => {
		if (!type) return searchData(dataPage, dataAll);

		if (isSearching()) dataPage = dataAll.length > 0 ? dataAll : dataPage;
		const sortMap: ShortlinkSort = {
			shorten: (a: IShortlink, b: IShortlink) => a.shorten.localeCompare(b.shorten),
			url: (a: IShortlink, b: IShortlink) => a.url.localeCompare(b.url),
			clickCount: (a: IShortlink, b: IShortlink) => a.clickCount - b.clickCount,
			author: (a: IShortlink, b: IShortlink) => a.author[0]?.username.localeCompare(b.author[0]?.username),
			createdAt: (a: IShortlink, b: IShortlink) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf(),
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
		setSearchShorten(params.get("shorten") || "");
		setSearchUrl(params.get("originalUrl") || "");
		setSearchAuthor(params.get("clicks") || "");
		setSearchAuthor(params.get("author") || "");
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
				title={"Shortlinks"}
				isSearching={isSearching()}
				router={router}
				// loading
				loadingDataAll={loadingDataAll}
				loadingDataPage={loadingDataPage}
				setLoadingDataAll={setLoadingDataAll}
				setLoadingDataPage={setLoadingDataPage}
				// page
				pages={pages}
				curPage={curPage}
				perPage={perPage}
				setCurPage={setCurPage}
				setPerPage={setPerPage}
				setPages={setPages}
				// data
				setDataPage={setDataPage}
				setDataAllPage={setDataAllPage}
				// tabs
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
									key={1}
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
									key={1}
									placeholder="Search by shorten url"
									name="shorten"
									label="Shorten"
									icon={<IconExternalLink size={14} stroke={1.5} />}
									value={searchShorten}
									onChange={(e) => handleInputQueryChange(e, setSearchShorten, e.target.name, router)}
									mt={16}
								/>
								<TextInput
									key={2}
									placeholder="Search by original url"
									name="originalUrl"
									label="Original URL"
									icon={<IconLink size={14} stroke={1.5} />}
									value={searchUrl}
									onChange={(e) => handleInputQueryChange(e, setSearchUrl, e.target.name, router)}
									mt={8}
								/>
								<NumberInput
									key={3}
									placeholder="Search by clicks field"
									name="clicks"
									label="Clicks"
									icon={<IconNumber9 size={14} stroke={1.5} />}
									value={parseInt(searchClickCount) ? parseInt(searchClickCount) : undefined}
									onChange={(value) => {
										if (!value) {
											setSearchClickCount("");
											removeQueryParam(router, "click");
										} else {
											setSearchClickCount(value.toString());
											addQueryParam(router, "click", value.toString());
										}
									}}
									mt={8}
									min={0}
								/>
								<TextInput
									key={4}
									placeholder="Search by author field"
									name="author"
									label="Author"
									icon={<IconLego size={14} stroke={1.5} />}
									value={searchAuthor}
									onChange={(e) => handleInputQueryChange(e, setSearchAuthor, e.target.name, router)}
									mt={8}
								/>
								<TextInput
									key={5}
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
				)}
				// table
				th_element={() => (
					<>
						<Th
							classes={classes}
							sorted={sortBy === "shorten"}
							reversed={reverseSortDirection}
							onSort={() => {
								if (sortBy === "shorten") setReverseSortDirection(!reverseSortDirection);
								setSortBy("shorten");
							}}
							width="20%"
						>
							Shorten
						</Th>
						<Th
							classes={classes}
							sorted={sortBy === "url"}
							reversed={reverseSortDirection}
							onSort={() => {
								if (sortBy === "url") setReverseSortDirection(!reverseSortDirection);
								setSortBy("url");
							}}
							width="30%"
						>
							Original
						</Th>
						<Th
							classes={classes}
							sorted={sortBy === "clickCount"}
							reversed={reverseSortDirection}
							onSort={() => {
								if (sortBy === "clickCount") setReverseSortDirection(!reverseSortDirection);
								setSortBy("clickCount");
							}}
							width="10%"
						>
							Clicks
						</Th>
						<Th
							classes={classes}
							sorted={sortBy === "author"}
							reversed={reverseSortDirection}
							onSort={() => {
								if (sortBy === "author") setReverseSortDirection(!reverseSortDirection);
								setSortBy("author");
							}}
							width="15%"
						>
							Author
						</Th>
						<Th
							classes={classes}
							sorted={sortBy === "createdAt"}
							reversed={reverseSortDirection}
							onSort={() => {
								if (sortBy === "createdAt") setReverseSortDirection(!reverseSortDirection);
								setSortBy("createdAt");
							}}
							width="15%"
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
										<a href={`/s/${row.shorten}`} target="_blank">
											<Text variant="link">{row.shorten}</Text>
										</a>
									</td>
									<td>
										<a href={`${row.url}`} target="_blank" rel="noopener noreferrer">
											<Text variant="link">{row.url}</Text>
										</a>
									</td>
									<td>{row.clickCount}</td>
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
									<td colSpan={6}>
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
