import type { NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UnstyledButton, Group, Text, TextInput, Tooltip, ActionIcon, Tabs, Collapse, TypographyStylesProvider } from "@mantine/core";
import { keys } from "@mantine/utils";
import { useLocalStorage } from "@mantine/hooks";
import { IconSearch, IconEdit, IconTrash, IconLego, IconLetterA, IconLicense, IconDeviceWatch } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { INote, validNoteSort, NoteSort } from "../../../interfaces/db";
import { actionPrompt, fillDataPage, fillDataAll, handleAdminTabChange, handleInputQueryChange } from "../../../helper/admin";
import { formatDateWithTz } from "../../../helper/global";
import { Th, useTableStyles } from "../../Utils/Dashboard";
import { MDPreview } from "../../Utils/Viewer/Markdown/MDPreview";
import { TableView } from "../Reusable/TableView";

export const Note: NextPage<IDashboardProps> = (props) => {
	const { classes } = useTableStyles();
	const router = useRouter();
	const api_url = "note";

	const [curPage, setCurPage] = useState(1);
	const [pages, setPages] = useState(1);
	const [perPage, setPerPage] = useLocalStorage({ key: "perPage-note", defaultValue: 25 });

	const [searchAll, setSearchAll] = useState("");
	const [searchTitle, setSearchTitle] = useState("");
	const [searchContent, setSearchContent] = useState("");
	const [searchAuthor, setSearchAuthor] = useState("");
	const [searchCreatedAt, setSearchCreatedAt] = useState("");

	const [dataAllPage, setDataAllPage] = useState<INote[]>([]);
	const [dataPage, setDataPage] = useState<INote[]>([]);
	const [sortBy, setSortBy] = useState<validNoteSort | null>(null);

	const [reverseSortDirection, setReverseSortDirection] = useState(false);
	const [loadingDataPage, setLoadingDataPage] = useState(true);
	const [loadingDataAll, setLoadingDataAll] = useState(true);
	const [tabIndex, setTabIndex] = useState(0);

	const [tz, setTz] = useState("UTC");

	// -----------------------------------------------------------
	// handler
	const handleDelete = (id: string) => actionPrompt({ context: "note", _id: id, api_url, setDataPage, setDataAllPage });
	// -----------------------------------------------------------
	// display
	const searchAllHelper = (item: INote, query: string) => {
		return (
			item.title.toLowerCase().includes(query.toLowerCase()) ||
			item.content.toLowerCase().includes(query.toLowerCase()) ||
			item.author[0]?.username.toLowerCase().includes(query.toLowerCase()) ||
			formatDateWithTz(item.createdAt, tz).toLowerCase().includes(query.toLowerCase())
		);
	};

	const isSearching = () => {
		// not on setting page and is actually searching and data all is fetched
		return tabIndex !== 2 && dataAllPage.length > 0 && (searchAll !== "" || searchTitle !== "" || searchContent !== "" || searchAuthor !== "" || searchCreatedAt !== "");
	};

	const searchData = (dataPage: INote[], dataAll: INote[]) => {
		// verify searching
		if (isSearching()) dataPage = dataAll;

		if (tabIndex === 0) {
			if (searchAll !== "") dataPage = dataPage.filter((item) => keys(dataPage[0]).some(() => searchAllHelper(item, searchAll)));
		} else if (tabIndex === 1) {
			if (searchTitle !== "") dataPage = dataPage.filter((item) => item.title.toLowerCase().includes(searchTitle.toLowerCase()));
			if (searchContent !== "") dataPage = dataPage.filter((item) => item.content.toLowerCase().includes(searchContent.toLowerCase()));
			if (searchAuthor !== "") dataPage = dataPage.filter((item) => item.author[0]?.username.toLowerCase().includes(searchAuthor.toLowerCase()));
			if (searchCreatedAt !== "") dataPage = dataPage.filter((item) => formatDateWithTz(item.createdAt, tz).toLowerCase().includes(searchCreatedAt.toLowerCase()));
		}

		return dataPage;
	};

	const sortSearchData = (type: validNoteSort | null, dataPage: INote[], dataAll: INote[]) => {
		if (!type) return searchData(dataPage, dataAll);

		if (isSearching()) dataPage = dataAll.length > 0 ? dataAll : dataPage;
		const sortMap: NoteSort = {
			title: (a: INote, b: INote) => a.title.localeCompare(b.title),
			content: (a: INote, b: INote) => a.content.localeCompare(b.content),
			author: (a: INote, b: INote) => a.author[0]?.username.localeCompare(b.author[0]?.username),
			createdAt: (a: INote, b: INote) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf(),
		};

		// sort
		let sortedData = dataPage.sort(sortMap[type]);
		if (reverseSortDirection) sortedData.reverse();

		return searchData(sortedData, dataAll);
	};

	// -----------------------------------------------------------
	// delete
	const fetchUrlParams = () => {
		const { query } = router;
		const params = new URLSearchParams(query as unknown as string);
		// set to local state
		setCurPage(params.get("page") ? parseInt(params.get("page") || "1") : 1);
		setSearchAll(params.get("qAll") || "");
		setSearchTitle(params.get("title") || "");
		setSearchContent(params.get("content") || "");
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
				title={"Notes"}
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
									placeholder="Search by content field"
									name="content"
									label="Content"
									icon={<IconLicense size={14} stroke={1.5} />}
									value={searchContent}
									onChange={(e) => handleInputQueryChange(e, setSearchContent, e.target.name, router)}
									mt={8}
								/>
								<TextInput
									placeholder="Search by author field"
									name="author"
									label="Author"
									icon={<IconLego size={14} stroke={1.5} />}
									value={searchAuthor}
									onChange={(e) => handleInputQueryChange(e, setSearchAuthor, e.target.name, router)}
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
				)}
				// table
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
							sorted={sortBy === "content"}
							reversed={reverseSortDirection}
							onSort={() => {
								if (sortBy === "content") setReverseSortDirection(!reverseSortDirection);
								setSortBy("content");
							}}
							width="40%"
						>
							Content
						</Th>
						<Th
							classes={classes}
							sorted={sortBy === "author"}
							reversed={reverseSortDirection}
							onSort={() => {
								if (sortBy === "author") setReverseSortDirection(!reverseSortDirection);
								setSortBy("author");
							}}
							width="18%"
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
							width="17%"
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
										<Link href={`${props.pathname?.split("?")[0]}/${row._id}`}>
											<a>
												<Text variant="link">{row.title}</Text>
											</a>
										</Link>
									</td>
									<td>
										<TypographyStylesProvider>
											<MDPreview content={row.content} />
										</TypographyStylesProvider>
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
									<td colSpan={5}>
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
