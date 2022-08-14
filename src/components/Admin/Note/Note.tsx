import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { createStyles, Table, ScrollArea, UnstyledButton, Group, Text, Center, TextInput, Tooltip, ActionIcon, Tabs, Button, LoadingOverlay } from "@mantine/core";
import { keys } from "@mantine/utils";
import { IconSelector, IconChevronDown, IconChevronUp, IconSearch, IconEdit, IconTrash, IconFilePlus } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { INote } from "../../../interfaces/db";
import { showNotification } from "@mantine/notifications";
import { SERVER_V1 } from "../../../utils";

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

	const [searchAll, setSearchAll] = useState("");
	const [notesData, setNotesData] = useState<INote[]>([]);
	const [sortBy, setSortBy] = useState<validSort | null>(null);

	const [reverseSortDirection, setReverseSortDirection] = useState(false);
	const [loading, setLoading] = useState(true);

	const [tz, setTz] = useState("UTC");

	const searchAllHelper = (item: INote, index: keyof INote) => {
		return (
			item.title.toLowerCase().includes(searchAll.toLowerCase()) ||
			item.content.toLowerCase().includes(searchAll.toLowerCase()) ||
			item.author[0].username.toLowerCase().includes(searchAll.toLowerCase()) ||
			formatDate(item.createdAt, tz).toLowerCase().includes(searchAll.toLowerCase())
		);
	};

	const searchData = (data: INote[], query: string) => {
		if (searchAll !== "") data = data.filter((item) => keys(data[0]).some((key, index) => searchAllHelper(item, key)));

		return data;
	};

	const sortData = (type: validSort | null, data: INote[], query: string) => {
		if (!type) return searchData(data, query);

		const sortMap: sortI = {
			title: (a: INote, b: INote) => a.title.localeCompare(b.title),
			content: (a: INote, b: INote) => a.content.localeCompare(b.content),
			author: (a: INote, b: INote) => a.author[0].username.localeCompare(b.author[0].username),
			createdAt: (a: INote, b: INote) => a.createdAt.valueOf() - b.createdAt.valueOf(),
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

	const fillData = async () => {
		try {
			const fetchData = await fetch(SERVER_V1 + "/note?perPage=20", {
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

	useEffect(() => {
		setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
		fillData();
	}, []);

	return (
		<>
			<div className="dash-flex">
				<h1>Dashboard Note</h1>
				<Button id="dash-add-new" ml={16} mt="auto" size="xs" compact leftIcon={<IconFilePlus size={20} />}>
					Add new
				</Button>
			</div>
			<div style={{ marginTop: "1.5rem" }}>
				<Tabs defaultValue="first">
					<Tabs.List>
						<Tabs.Tab value="first" color="green">
							Search
						</Tabs.Tab>
						<Tabs.Tab value="second" color="lime">
							Advanced Search
						</Tabs.Tab>
						<Tabs.Tab value="third" color="blue">
							Setting
						</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value="first" pt="xs">
						<TextInput placeholder="Search by any field" mb="md" icon={<IconSearch size={14} stroke={1.5} />} value={searchAll} onChange={(e) => setSearchAll(e.target.value)} />
					</Tabs.Panel>

					<Tabs.Panel value="second" pt="xs">
						Multiple search input
					</Tabs.Panel>

					<Tabs.Panel value="third" pt="xs">
						Setting
					</Tabs.Panel>
				</Tabs>
			</div>

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
							{notesData && notesData.length > 0 && sortData(sortBy, notesData, searchAll).length > 0 ? (
								sortData(sortBy, notesData, searchAll).map((row) => (
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
