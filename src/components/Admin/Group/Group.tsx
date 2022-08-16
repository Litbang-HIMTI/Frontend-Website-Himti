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
} from "@mantine/core";
import { keys } from "@mantine/utils";
import { showNotification } from "@mantine/notifications";
import { IconSearch, IconEdit, IconTrash, IconRefresh } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { IGroup, validGroupSort, GroupSort } from "../../../interfaces/db";
import { addQueryParam, removeQueryParam, SERVER_V1, formatDateWithTz } from "../../../helper";
import { Th, useTableStyles, MConfirmContinue, TitleDashboard } from "../../Utils/Dashboard";

export const UserGroup: NextPage<IDashboardProps> = (props) => {
	const { classes } = useTableStyles();
	const router = useRouter();
	const [openModalDelete, setOpenModalDelete] = useState(false);
	const [idDelete, setIdDelete] = useState("");

	const [curPage, setCurPage] = useState(1);
	const [pages, setPages] = useState(1);
	const [perPage, setPerPage] = useState(25);

	const [searchAll, setSearchAll] = useState("");

	const [groupDataAll, setGroupDataAll] = useState<IGroup[]>([]);
	const [groupData, setGroupData] = useState<IGroup[]>([]);
	const [sortBy, setSortBy] = useState<validGroupSort | null>(null);

	const [reverseSortDirection, setReverseSortDirection] = useState(false);
	const [loadingDataPage, setLoadingDataPage] = useState(true);
	const [loadingDataAll, setLoadingDataAll] = useState(true);
	const [tabIndex, setTabIndex] = useState(0);

	const [tz, setTz] = useState("UTC");

	// -----------------------------------------------------------
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
		return tabIndex !== 2 && groupDataAll.length > 0 && searchAll !== "";
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
	const deleteGroup = async (id: string) => {
		try {
			const deleteFetch = await fetch(`${SERVER_V1}/note/${id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			const deleteData = await deleteFetch.json();
			if (deleteFetch.status === 200 && deleteData && deleteData.success) {
				// slice data
				setGroupData((prev) => {
					return prev.filter((item) => item._id !== id);
				});
				setGroupDataAll((prev) => {
					return prev.filter((item) => item._id !== id);
				});

				showNotification({ title: "Success", message: deleteData.message });
			} else {
				showNotification({ title: "Error", message: deleteData.message, color: "red" });
			}
			setOpenModalDelete(false);
		} catch (error: any) {
			setOpenModalDelete(false);
			showNotification({ title: "Error", message: error.message, color: "red" });
		}
	};

	// fetch
	const fillDataAll = async () => {
		try {
			setLoadingDataAll(true);
			const fetchData = await fetch(SERVER_V1 + `/group`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			const { data, message }: { data: IGroup[]; message: string; page: number; pages: number } = await fetchData.json();
			if (fetchData.status !== 200) {
				setLoadingDataAll(false);
				return showNotification({ title: "Error indexing all data for search", message, color: "red" });
			}

			setGroupDataAll(data);
			setLoadingDataAll(false);
		} catch (error: any) {
			setLoadingDataAll(false);
			showNotification({ title: "Error indexing all data for search", message: error.message, color: "red" });
		}
	};

	const fillData = async (perPage: number, curPageQ: number) => {
		try {
			setLoadingDataPage(true);
			const fetchData = await fetch(SERVER_V1 + `/group?perPage=${perPage}&page=${curPageQ}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			const { data, message, page, pages }: { data: IGroup[]; message: string; page: number; pages: number } = await fetchData.json();
			if (fetchData.status !== 200) {
				setLoadingDataPage(false);
				return showNotification({ title: "Error getting page data", message, color: "red" });
			}

			setCurPage(page);
			setPages(pages);
			setGroupData(data);
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
		// fill data with setting
		if (localStorage.getItem("perPage-group")) {
			setPerPage(parseInt(localStorage.getItem("perPage-group") as string));
			fillData(parseInt(localStorage.getItem("perPage-group")!), curPage);
		} else {
			localStorage.setItem("perPage-group", perPage.toString());
			fillData(perPage, curPage);
		}
		fillDataAll();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<MConfirmContinue opened={openModalDelete} closeFunc={() => setOpenModalDelete(false)} confirmFunc={() => deleteGroup(idDelete)} />
			<TitleDashboard title="Group" hrefAddNew={`${props.pathname}/create`} hrefText="Add new" />

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
									localStorage.setItem("perPage-group", value.toString());
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
									width="45%"
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
									width="10%"
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
							{groupData && groupData.length > 0 && sortSearchData(sortBy, groupData, groupDataAll).length > 0 ? (
								sortSearchData(sortBy, groupData, groupDataAll).map((row) => (
									<tr key={row._id}>
										<td>
											<Text variant="link" component="a" href={`${props.pathname}/${row._id}`}>
												{row.name}
											</Text>
										</td>
										<td>{row.description}</td>
										<td>{row.count}</td>
										<td>{formatDateWithTz(row.createdAt, tz)}</td>
										<td style={{ padding: "1rem .5rem" }}>
											<div className="dash-flex">
												<Link href={`${props.pathname}/${row._id}`}>
													<ActionIcon>
														<IconEdit size={14} stroke={1.5} />
													</ActionIcon>
												</Link>
												<ActionIcon
													onClick={() => {
														setIdDelete(row._id);
														setOpenModalDelete(true);
													}}
												>
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
