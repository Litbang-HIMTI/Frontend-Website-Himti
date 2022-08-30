import type { NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import { JSXElementConstructor, useEffect, useState } from "react";
import {
	Table,
	ScrollArea,
	UnstyledButton,
	Group,
	Text,
	Center,
	TextInput,
	ActionIcon,
	Tabs,
	Button,
	LoadingOverlay,
	Divider,
	Collapse,
	NumberInput,
	Pagination,
	Tooltip,
} from "@mantine/core";
import { keys } from "@mantine/utils";
import { openConfirmModal } from "@mantine/modals";
import { useLocalStorage } from "@mantine/hooks";
import { IconSearch, IconEdit, IconTrash, IconRefresh } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { IGroup, validGroupSort, GroupSort } from "../../../interfaces/db";
import { addQueryParam, removeQueryParam, formatDateWithTz, handleTabChange, handlePageChange } from "../../../helper";
import { Th, useTableStyles, TitleDashboard } from "../../Utils/Dashboard";
import { deleteData, fillDataPage, fillDataAll } from "../../../helper/admin/fetchData";
import { TableView } from "../Reusable/TableView";

export const UserGroup: NextPage<IDashboardProps> = (props) => {
	const { classes } = useTableStyles();
	const router = useRouter();
	const api_url = "group";

	const [curPage, setCurPage] = useState(1);
	const [pages, setPages] = useState(1);
	const [perPage, setPerPage] = useLocalStorage({ key: "perPage-group", defaultValue: 25 });

	const [searchAll, setSearchAll] = useState("");

	const [dataAllPage, setDataAllPage] = useState<IGroup[]>([]);
	const [dataPage, setDataPage] = useState<IGroup[]>([]);
	const [sortBy, setSortBy] = useState<validGroupSort | null>(null);

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

	const handleDelete = (id: string) => {
		openConfirmModal({
			title: "Delete confirmation",
			children: <Text size="sm">Are you sure you want to delete this group? This action is irreversible, destructive, and there is no way to recover the deleted data.</Text>,
			labels: { confirm: "Yes, delete group", cancel: "No, cancel" },
			confirmProps: { color: "red" },
			onCancel: () => {},
			onConfirm: () => deleteData(id, api_url, setDataPage, setDataAllPage),
		});
	};

	// -----------------------------------------------------------
	// display
	const searchAllHelper = (item: IGroup, query: string) => {
		return (
			item.name.toLowerCase().includes(query.toLowerCase()) ||
			item.description.toLowerCase().includes(query.toLowerCase()) ||
			formatDateWithTz(item.createdAt, tz).toLowerCase().includes(query.toLowerCase())
		);
	};

	const isSearching = () => {
		// not on setting page and is actually searching and data all is fetched
		return tabIndex !== 2 && dataAllPage.length > 0 && searchAll !== "";
	};

	const searchData = (dataPage: IGroup[], dataAll: IGroup[]) => {
		// verify searching
		if (isSearching()) dataPage = dataAll;
		if (searchAll !== "") dataPage = dataPage.filter((item) => keys(dataPage[0]).some(() => searchAllHelper(item, searchAll)));

		return dataPage;
	};

	const sortSearchData = (type: validGroupSort | null, dataPage: IGroup[], dataAll: IGroup[]) => {
		if (!type) return searchData(dataPage, dataAll);

		if (isSearching()) dataPage = dataAll.length > 0 ? dataAll : dataPage;
		const sortMap: GroupSort = {
			name: (a: IGroup, b: IGroup) => a.name.localeCompare(b.name),
			description: (a: IGroup, b: IGroup) => a.description.localeCompare(b.description),
			count: (a: IGroup, b: IGroup) => a.count - b.count,
			createdAt: (a: IGroup, b: IGroup) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf(),
		};

		// sort
		let sortedData = dataPage.sort(sortMap[type]);
		if (reverseSortDirection) sortedData.reverse();

		return searchData(sortedData, dataAll);
	};

	// -----------------------------------------------------------
	// fetch
	const fetchUrlParams = () => {
		const { query } = router;
		const params = new URLSearchParams(query as unknown as string);
		// set to local state
		setCurPage(params.get("page") ? parseInt(params.get("page") || "1") : 1);
		setSearchAll(params.get("qAll") || "");
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
				title={"User Groups"}
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
				handle_tabs_change={(val) => handleTabChange(val, setTabIndex, router)}
				tabs_header_length={1}
				tabs_element_header={() => (
					<>
						<Tabs.Tab value="0" color="green">
							Search
						</Tabs.Tab>
					</>
				)}
				tabs_element_body={() => (
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
				)}
				// table
				th_element={() => (
					<>
						<Th
							classes={classes}
							sorted={sortBy === "name"}
							reversed={reverseSortDirection}
							onSort={() => {
								if (sortBy === "name") setReverseSortDirection(!reverseSortDirection);
								setSortBy("name");
							}}
							width="20%"
						>
							Title
						</Th>
						<Th
							classes={classes}
							sorted={sortBy === "description"}
							reversed={reverseSortDirection}
							onSort={() => {
								if (sortBy === "description") setReverseSortDirection(!reverseSortDirection);
								setSortBy("description");
							}}
							width="40%"
						>
							Description
						</Th>
						<Th
							classes={classes}
							sorted={sortBy === "description"}
							reversed={reverseSortDirection}
							onSort={() => {
								if (sortBy === "description") setReverseSortDirection(!reverseSortDirection);
								setSortBy("description");
							}}
							width="15%"
						>
							User Count
						</Th>
						<Th
							classes={classes}
							sorted={sortBy === "createdAt"}
							reversed={reverseSortDirection}
							onSort={() => {
								if (sortBy === "createdAt") setReverseSortDirection(!reverseSortDirection);
								setSortBy("createdAt");
							}}
							width="20%"
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
												<Text variant="link">{row.name}</Text>
											</a>
										</Link>
									</td>
									<td>{row.description}</td>
									<td>
										<Link href={`user?tab=1&group=${row.name.replaceAll(" ", "+")}`}>
											<a>
												<Text variant="link">{row.count}</Text>
											</a>
										</Link>
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
