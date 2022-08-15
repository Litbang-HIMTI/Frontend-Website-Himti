import type { NextPage } from "next";
import { useEffect, useState } from "react";
import {
	createStyles,
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
} from "@mantine/core";
import { keys } from "@mantine/utils";
import { IconSelector, IconChevronDown, IconChevronUp, IconSearch, IconEdit, IconTrash, IconFilePlus, IconLego, IconLetterA, IconLicense, IconDeviceWatch, IconRefresh } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { INote } from "../../../interfaces/db";
import { showNotification } from "@mantine/notifications";
import { SERVER_V1 } from "../../../utils";
import { NextRouter, useRouter } from "next/router";

const useStyles = createStyles((theme) => ({
	th: {
		padding: "0 !important",
	},

	control: {
		width: "100%",
		padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,

		"&:hover": {
			backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
		},
	},

	icon: {
		width: 21,
		height: 21,
		borderRadius: 21,
	},
}));

interface ThProps {
	classes: Record<string, string>;
	children: React.ReactNode;
	reversed: boolean;
	sorted: boolean;
	onSort(): void;
	width?: string;
}

function Th({ classes, children, reversed, sorted, onSort, width }: ThProps) {
	const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
	return (
		<th className={classes.th} style={{ width }}>
			<UnstyledButton onClick={onSort} className={classes.control}>
				<Group position="apart">
					<Text weight={500} size="sm">
						{children}
					</Text>
					<Center className={classes.icon}>
						<Icon size={14} stroke={1.5} />
					</Center>
				</Group>
			</UnstyledButton>
		</th>
	);
}

type validSort = "title" | "content" | "author" | "createdAt";
interface sortI {
	title: (a: INote, b: INote) => number;
	content: (a: INote, b: INote) => number;
	author: (a: INote, b: INote) => number;
	createdAt: (a: INote, b: INote) => number;
}

export const Note: NextPage<IDashboardProps> = (props) => {
	const { classes } = useStyles();
	const router = useRouter();

	const [searchAll, setSearchAll] = useState("");
	const [searchTitle, setSearchTitle] = useState("");
	const [searchContent, setSearchContent] = useState("");
	const [searchAuthor, setSearchAuthor] = useState("");
	const [searchCreatedAt, setSearchCreatedAt] = useState("");
	const [perPage, setPerPage] = useState(25);

	const [notesData, setNotesData] = useState<INote[]>([]);
	const [sortBy, setSortBy] = useState<validSort | null>(null);

	const [reverseSortDirection, setReverseSortDirection] = useState(false);
	const [loading, setLoading] = useState(true);
	const [tabIndex, setTabIndex] = useState(0);

	const [tz, setTz] = useState("UTC");

	// -----------------------------------------------------------
	const removeQueryParam = (param: string) => {
		const { pathname, query } = router;
		const params = new URLSearchParams(query as unknown as string);
		params.delete(param);
		router.replace({ pathname, query: params.toString() }, undefined, { shallow: true });
	};

	const addQueryParam = (param: string, value: string) => {
		const { pathname } = router;
		const params = new URLSearchParams(router.query as unknown as string);
		params.set(param, value);
		router.replace({ pathname, query: params.toString() }, undefined, { shallow: true });
	};

	const handleInputQueryChange = (e: React.ChangeEvent<HTMLInputElement>, setFunc: (value: string) => void, param: string) => {
		setFunc(e.target.value);
		if (e.target.value === "") removeQueryParam(param);
		else addQueryParam(param, e.target.value);
	};

	const handleTabChange = (index: TabsValue) => {
		setTabIndex(index ? parseInt(index) : 0);
		addQueryParam("tab", index ? index : "0");
	};

	// -----------------------------------------------------------
	// display
	const searchAllHelper = (item: INote, query: string) => {
		return (
			item.title.toLowerCase().includes(query.toLowerCase()) ||
			item.content.toLowerCase().includes(query.toLowerCase()) ||
			item.author[0].username.toLowerCase().includes(query.toLowerCase()) ||
			formatDate(item.createdAt, tz).toLowerCase().includes(query.toLowerCase())
		);
	};

	const searchData = (data: INote[], query: string) => {
		if (tabIndex === 0) {
			if (searchAll !== "") data = data.filter((item) => keys(data[0]).some((key) => searchAllHelper(item, query)));
		} else {
			if (searchTitle !== "") data = data.filter((item) => item.title.toLowerCase().includes(searchTitle.toLowerCase()));
			if (searchContent !== "") data = data.filter((item) => item.content.toLowerCase().includes(searchContent.toLowerCase()));
			if (searchAuthor !== "") data = data.filter((item) => item.author[0].username.toLowerCase().includes(searchAuthor.toLowerCase()));
			if (searchCreatedAt !== "") data = data.filter((item) => formatDate(item.createdAt, tz).toLowerCase().includes(searchCreatedAt.toLowerCase()));
		}

		return data;
	};

	const sortSearchData = (type: validSort | null, data: INote[], query: string) => {
		if (!type) return searchData(data, query);

		const sortMap: sortI = {
			title: (a: INote, b: INote) => a.title.localeCompare(b.title),
			content: (a: INote, b: INote) => a.content.localeCompare(b.content),
			author: (a: INote, b: INote) => a.author[0].username.localeCompare(b.author[0].username),
			createdAt: (a: INote, b: INote) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf(),
		};

		// sort
		let sortedData = data.sort(sortMap[type]);
		if (reverseSortDirection) sortedData.reverse();

		return searchData(sortedData, query);
	};

	const formatDate = (date: Date, tz: string) => {
		const d = new Date(date);
		return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} - ${d.toLocaleTimeString("en-us", { timeZone: tz })}`;
	};

	// -----------------------------------------------------------
	// fetch
	const fillData = async (perPage: number) => {
		try {
			setLoading(true);
			const fetchData = await fetch(SERVER_V1 + `/note?perPage=${perPage}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			const { data, message }: { data: INote[]; message: string } = await fetchData.json();
			if (fetchData.status !== 200) return showNotification({ title: "Error", message, color: "red" });

			setNotesData(data);
			setLoading(false);
		} catch (error) {
			setLoading(false);
			// notify
			showNotification({
				title: "Error",
				message: `Something went wrong\n${error}`,
				color: "red",
			});
		}
	};

	const fetchUrlParams = () => {
		// set to local state
		const { query } = router;
		const params = new URLSearchParams(query as unknown as string);
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
		// fill data with setting
		if (localStorage.getItem("perPage-note")) {
			setPerPage(parseInt(localStorage.getItem("perPage-note") as string));
			fillData(parseInt(localStorage.getItem("perPage-note")!));
		} else {
			localStorage.setItem("perPage-note", perPage.toString());
			fillData(perPage);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<div className="dash-flex">
				<h1>Notes</h1>
				<Button id="dash-add-new" ml={16} mt="auto" size="xs" compact leftIcon={<IconFilePlus size={20} />}>
					Add new
				</Button>
			</div>
			<div style={{ marginTop: "1.5rem" }}>
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
								placeholder="Search by content field"
								name="content"
								label="Content"
								icon={<IconLicense size={14} stroke={1.5} />}
								value={searchContent}
								onChange={(e) => handleInputQueryChange(e, setSearchContent, e.target.name)}
								mt={8}
							/>
							<TextInput
								placeholder="Search by author field"
								name="author"
								label="Author"
								icon={<IconLego size={14} stroke={1.5} />}
								value={searchAuthor}
								onChange={(e) => handleInputQueryChange(e, setSearchAuthor, e.target.name)}
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

					<Tabs.Panel value="2" pt="xs" className="dash-textinput-gap">
						<Collapse in={tabIndex === 2}>
							<Text color="dimmed">Customize data load setting</Text>

							<NumberInput
								label="Item per page"
								placeholder="Item per page"
								description="How many item per page in the dashboard (default: 25, min: 5, max: 100)"
								value={perPage}
								stepHoldDelay={500}
								stepHoldInterval={100}
								min={5}
								max={50}
								onChange={(value) => {
									if (!value) return;
									setPerPage(value);
									localStorage.setItem("perPage-note", value.toString());
								}}
								mt={8}
							/>

							<Button
								compact
								leftIcon={<IconRefresh size={20} />}
								onClick={() => {
									fillData(perPage);
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
				<LoadingOverlay visible={loading} overlayBlur={3} />
				<ScrollArea mt={30}>
					<Table horizontalSpacing="md" verticalSpacing="xs" sx={{ tableLayout: "fixed", minWidth: 600 }} highlightOnHover>
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
									width="20%"
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
							</tr>
						</thead>
						<tbody>
							{notesData && notesData.length > 0 && sortSearchData(sortBy, notesData, searchAll).length > 0 ? (
								sortSearchData(sortBy, notesData, searchAll).map((row) => (
									<tr key={row._id}>
										<td>{row.title}</td>
										<td>{row.content}</td>
										<td>
											{row.editedBy ? (
												<>
													<Tooltip label={`Last edited by: ${row.editedBy[0].username}`}>
														<span>{row.author[0].username}</span>
													</Tooltip>
												</>
											) : (
												row.author[0].username
											)}
										</td>
										<td>
											{row.editedBy ? (
												<Tooltip label={`Last edited at: ${formatDate(row.updatedAt, tz)}`}>
													<span>{formatDate(row.createdAt, tz)}</span>
												</Tooltip>
											) : (
												<>{formatDate(row.createdAt, tz)}</>
											)}
										</td>
										<td>
											<div className="dash-flex">
												<ActionIcon>
													<IconEdit size={14} stroke={1.5} />
												</ActionIcon>
												<ActionIcon>
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
						</tbody>
					</Table>
				</ScrollArea>
			</div>
		</>
	);
};
