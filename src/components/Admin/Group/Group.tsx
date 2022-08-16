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
	ActionIcon,
	Tabs,
	Button,
	LoadingOverlay,
	Divider,
	Collapse,
	NumberInput,
	TabsValue,
	Pagination,
	Tooltip,
} from "@mantine/core";
import { keys } from "@mantine/utils";
import { showNotification } from "@mantine/notifications";
import { openConfirmModal } from "@mantine/modals";
import { useLocalStorage } from "@mantine/hooks";
import { IconSearch, IconEdit, IconTrash, IconRefresh } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { IGroup, validGroupSort, GroupSort, GroupQRes } from "../../../interfaces/db";
import { addQueryParam, removeQueryParam, SERVER_V1, formatDateWithTz } from "../../../helper";
import { Th, useTableStyles, TitleDashboard } from "../../Utils/Dashboard";

export const UserGroup: NextPage<IDashboardProps> = (props) => {
	const { classes } = useTableStyles();
	const router = useRouter();
	const [idDelete, setIdDelete] = useState("");

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
		setIdDelete(id);
		openConfirmModal({
			title: "Delete confirmation",
			children: <Text size="sm">Are you sure you want to delete this group? This action is irreversible, destructive, and there is no way to recover the deleted data.</Text>,
			labels: { confirm: "Yes, delete group", cancel: "No, cancel" },
			confirmProps: { color: "red" },
			onCancel: () => {},
			onConfirm: () => deleteData(),
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
	// delete
	const deleteData = async () => {
		try {
			const req = await fetch(`${SERVER_V1}/group/${idDelete}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			const { success, message }: GroupQRes = await req.json();
			if (req.status === 200 && success) {
				// slice data
				setDataPage((prev) => {
					return prev.filter((item) => item._id !== idDelete);
				});
				setDataAllPage((prev) => {
					return prev.filter((item) => item._id !== idDelete);
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
			const req = await fetch(SERVER_V1 + `/group`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			const { data, message }: GroupQRes = await req.json();
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
			const req = await fetch(SERVER_V1 + `/group?perPage=${perPage}&page=${curPageQ}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			const { data, message, page, pages }: GroupQRes = await req.json();
			if (req.status !== 200) {
				setLoadingDataPage(false);
				return showNotification({ title: "Error getting page data", message, color: "red" });
			}

			setCurPage(page);
			setPages(pages);
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
			<TitleDashboard title="Group" hrefLink={`${props.pathname}/create`} hrefText="Add new" />

			<div>
				<Tabs value={tabIndex.toString() || "0"} onTabChange={handleTabChange}>
					<Tabs.List>
						<Tabs.Tab value="0" color="green">
							Search
						</Tabs.Tab>
						<Tabs.Tab value="1" color="blue">
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
					</div>
					<Tabs.Panel value="1" pt="xs" className="dash-textinput-gap">
						<Collapse in={tabIndex === 1}>
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
							</tr>
						</thead>
						<tbody>
							{dataPage && dataPage.length > 0 && sortSearchData(sortBy, dataPage, dataAllPage).length > 0 ? (
								sortSearchData(sortBy, dataPage, dataAllPage).map((row) => (
									<tr key={row._id}>
										<td>
											<Link href={`${props.pathname}/${row._id}`}>
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
												<Link href={`${props.pathname}/${row._id}`}>
													<ActionIcon>
														<IconEdit size={14} stroke={1.5} />
													</ActionIcon>
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
						</tbody>
					</Table>
				</ScrollArea>
			</div>
			<Center mt={16}>{!isSearching() && <Pagination total={pages} page={curPage} onChange={pageChange} />}</Center>
		</>
	);
};
