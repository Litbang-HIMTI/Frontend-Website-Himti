import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { createStyles, Table, ScrollArea, UnstyledButton, Group, Text, Center, TextInput, Tooltip, ActionIcon } from "@mantine/core";
import { keys } from "@mantine/utils";
import { IconSelector, IconChevronDown, IconChevronUp, IconSearch, IconEdit, IconTrash } from "@tabler/icons";
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

interface RowData {
	name: string;
	email: string;
	company: string;
}

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

function filterData(data: RowData[], search: string) {
	const query = search.toLowerCase().trim();
	return data.filter((item) => keys(data[0]).some((key) => item[key].toLowerCase().includes(query)));
}

// function sortData(data: RowData[], payload: { sortBy: keyof RowData | null; reversed: boolean; search: string }) {
function sortData(data: any[], payload: any) {
	const { sortBy } = payload;

	if (!sortBy) {
		return filterData(data, payload.search);
	}

	return filterData(
		[...data].sort((a, b) => {
			if (payload.reversed) {
				return b[sortBy].localeCompare(a[sortBy]);
			}

			return a[sortBy].localeCompare(b[sortBy]);
		}),
		payload.search
	);
}

export const Note: NextPage<IDashboardProps> = (props) => {
	const { classes } = useStyles();
	const [search, setSearch] = useState("");
	const [sortedData, setSortedData] = useState<INote[] | null>(null);
	const [sortBy, setSortBy] = useState<any>(null);
	const [reverseSortDirection, setReverseSortDirection] = useState(false);
	const [loading, setLoading] = useState(false);
	const [tz, setTz] = useState("UTC");

	// const setSorting = (field: keyof RowData) => {
	const setSorting = (field: any) => {
		const reversed = field === sortBy ? !reverseSortDirection : false;
		setReverseSortDirection(reversed);
		setSortBy(field);
		// setSortedData(sortData(data, { sortBy: field, reversed, search }));
	};

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.currentTarget;
		setSearch(value);
		// setSortedData(sortData(data, { sortBy, reversed: reverseSortDirection, search: value }));
	};

	const formatDate = (date: Date) => {
		const d = new Date(date);
		return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
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

			if (fetchData.status !== 200) return;

			const { data }: { data: INote[] } = await fetchData.json();
			setSortedData(data);
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
			<h1>Dashboard Note</h1>
			<ScrollArea mt={30}>
				<TextInput placeholder="Search by any field" mb="md" icon={<IconSearch size={14} stroke={1.5} />} value={search} onChange={handleSearchChange} />
				<Table horizontalSpacing="md" verticalSpacing="xs" sx={{ tableLayout: "fixed", minWidth: 600 }} highlightOnHover>
					{/* <Table horizontalSpacing="md" verticalSpacing="xs" sx={{ width: "100%" }} highlightOnHover> */}
					<thead>
						<tr>
							<Th classes={classes} sorted={sortBy === "title"} reversed={reverseSortDirection} onSort={() => setSorting("title")} width="20%">
								Title
							</Th>
							<Th classes={classes} sorted={sortBy === "content"} reversed={reverseSortDirection} onSort={() => setSorting("content")} width="40%">
								Content
							</Th>
							<Th classes={classes} sorted={sortBy === "author"} reversed={reverseSortDirection} onSort={() => setSorting("author")} width="15%">
								Author
							</Th>
							<Th classes={classes} sorted={sortBy === "createdAt"} reversed={reverseSortDirection} onSort={() => setSorting("createdAt")} width="15%">
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
						{sortedData && sortedData.length > 0 ? (
							sortedData!.map((row) => (
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
										{formatDate(row.createdAt)} - {new Date(row.createdAt).toLocaleTimeString("en-us", { timeZone: tz })}
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
							<tr>
								<td colSpan={4}>
									<Text weight={500} align="center">
										Nothing found
									</Text>
								</td>
							</tr>
						)}
					</tbody>
				</Table>
			</ScrollArea>
		</>
	);
};
