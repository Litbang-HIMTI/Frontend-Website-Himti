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
} from "@mantine/core";
import { keys } from "@mantine/utils";
import { showNotification } from "@mantine/notifications";
import { openConfirmModal } from "@mantine/modals";
import { useLocalStorage } from "@mantine/hooks";
import { IconSearch, IconEdit, IconTrash, IconUsers, IconLetterA, IconBriefcase, IconDeviceWatch, IconRefresh } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { IUser, validUserSort, UserSort, UserQRes } from "../../../interfaces/db";
import { addQueryParam, removeQueryParam, SERVER_V1, formatDateWithTz } from "../../../helper";
import { Th, useTableStyles, TitleDashboard } from "../../Utils/Dashboard";

export const User: NextPage<IDashboardProps> = (props) => {
	const { classes } = useTableStyles();
	const router = useRouter();
	const [idDelete, setIdDelete] = useState("");

	const [curPage, setCurPage] = useState(1);
	const [pages, setPages] = useState(1);
	const [perPage, setPerPage] = useLocalStorage({ key: "perPage-user", defaultValue: 25 });

	const [searchAll, setSearchAll] = useState("");
	const [searchUsername, setSearchUsername] = useState("");
	const [searchRole, setSearchRole] = useState("");
	const [searchGroup, setSearchGroup] = useState("");
	const [searchCreatedAt, setSearchCreatedAt] = useState("");

	const [dataAllPage, setDataAllPage] = useState<IUser[]>([]);
	const [dataPage, setDataPage] = useState<IUser[]>([]);
	const [sortBy, setSortBy] = useState<validUserSort | null>(null);

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
			children: <Text size="sm">Are you sure you want to delete this user? This action is irreversible, destructive, and there is no way to recover the deleted data.</Text>,
			labels: { confirm: "Yes, delete user", cancel: "No, cancel" },
			confirmProps: { color: "red" },
			onCancel: () => {},
			onConfirm: () => deleteData(),
		});
	};

	// -----------------------------------------------------------
	// display
	const searchAllHelper = (item: IUser, query: string) => {
		return (
			item.username.toLowerCase().includes(query.toLowerCase()) ||
			item.role.some((role) => role.toLowerCase().includes(query.toLowerCase())) ||
			item.group?.some((group) => group.name.toLowerCase().includes(query.toLowerCase())) ||
			formatDateWithTz(item.createdAt, tz).toLowerCase().includes(query.toLowerCase())
		);
	};

	const isSearching = () => {
		// not on setting page and is actually searching and data all is fetched
		return tabIndex !== 2 && dataAllPage.length > 0 && (searchAll !== "" || searchUsername !== "" || searchRole !== "" || searchGroup !== "" || searchCreatedAt !== "");
	};

	const searchData = (dataPage: IUser[], dataAll: IUser[]) => {
		// verify searching
		if (isSearching()) dataPage = dataAll;

		if (tabIndex === 0) {
			if (searchAll !== "") dataPage = dataPage.filter((item) => keys(dataPage[0]).some(() => searchAllHelper(item, searchAll)));
		} else if (tabIndex === 1) {
			if (searchUsername !== "") dataPage = dataPage.filter((item) => item.username.toLowerCase().includes(searchUsername.toLowerCase()));
			if (searchRole !== "") dataPage = dataPage.filter((item) => item.role.some((role) => role.toLowerCase().includes(searchRole.toLowerCase())));
			if (searchGroup !== "") dataPage = dataPage.filter((item) => (item.group ? item.group.some((group) => group.name.toLowerCase().includes(searchGroup.toLowerCase())) : false));
			if (searchCreatedAt !== "") dataPage = dataPage.filter((item) => formatDateWithTz(item.createdAt, tz).toLowerCase().includes(searchCreatedAt.toLowerCase()));
		}

		return dataPage;
	};

	const sortSearchData = (type: validUserSort | null, dataPage: IUser[], dataAll: IUser[]) => {
		if (!type) return searchData(dataPage, dataAll);

		if (isSearching()) dataPage = dataAll.length > 0 ? dataAll : dataPage;
		const sortMap: UserSort = {
			username: (a: IUser, b: IUser) => a.username.localeCompare(b.username),
			role: (a: IUser, b: IUser) => a.role.join("").localeCompare(b.role.join("")),
			group: (a: IUser, b: IUser) => (a.group && b.group ? a.group.join("").localeCompare(b.group.join("")) : 0),
			createdAt: (a: IUser, b: IUser) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf(),
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
			const req = await fetch(`${SERVER_V1}/user/${idDelete}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			const deleteData = await req.json();
			if (req.status === 200 && deleteData && deleteData.success) {
				// slice data
				setDataPage((prev) => {
					return prev.filter((item) => item._id !== idDelete);
				});
				setDataAllPage((prev) => {
					return prev.filter((item) => item._id !== idDelete);
				});

				showNotification({ title: "Success", message: deleteData.message });
			} else {
				showNotification({ title: "Error", message: deleteData.message, color: "red" });
			}
		} catch (error: any) {
			showNotification({ title: "Error", message: error.message, color: "red" });
		}
	};

	// fetch
	const fillDataAll = async () => {
		try {
			setLoadingDataAll(true);
			const req = await fetch(SERVER_V1 + `/user`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			const { data, message }: UserQRes = await req.json();
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
			const req = await fetch(SERVER_V1 + `/user?perPage=${perPage}&page=${curPageQ}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			const { data, message, page, pages }: UserQRes = await req.json();
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
		setSearchUsername(params.get("username") || "");
		setSearchRole(params.get("role") || "");
		setSearchGroup(params.get("group") || "");
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
			<TitleDashboard title="User" hrefLink={`${props.pathname}/create`} hrefText="Add new" />
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
									placeholder="Search by username field"
									name="username"
									label="Username"
									icon={<IconLetterA size={14} stroke={1.5} />}
									value={searchUsername}
									onChange={(e) => handleInputQueryChange(e, setSearchUsername, e.target.name)}
									mt={16}
								/>
								<TextInput
									placeholder="Search by role field"
									name="role"
									label="Role"
									icon={<IconBriefcase size={14} stroke={1.5} />}
									value={searchRole}
									onChange={(e) => handleInputQueryChange(e, setSearchRole, e.target.name)}
									mt={8}
								/>
								<TextInput
									placeholder="Search by group field"
									name="group"
									label="Group"
									icon={<IconUsers size={14} stroke={1.5} />}
									value={searchGroup}
									onChange={(e) => handleInputQueryChange(e, setSearchGroup, e.target.name)}
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
									sorted={sortBy === "username"}
									reversed={reverseSortDirection}
									onSort={() => {
										if (sortBy === "username") setReverseSortDirection(!reverseSortDirection);
										setSortBy("username");
									}}
									width="20%"
								>
									Username
								</Th>
								<Th
									classes={classes}
									sorted={sortBy === "role"}
									reversed={reverseSortDirection}
									onSort={() => {
										if (sortBy === "role") setReverseSortDirection(!reverseSortDirection);
										setSortBy("role");
									}}
									width="20%"
								>
									Role
								</Th>
								<Th
									classes={classes}
									sorted={sortBy === "group"}
									reversed={reverseSortDirection}
									onSort={() => {
										if (sortBy === "group") setReverseSortDirection(!reverseSortDirection);
										setSortBy("group");
									}}
									width="20%"
								>
									Group
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
								<th className={classes.th} style={{ width: "20%" }}>
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
											<Link href={`${props.pathname}/${row.username}`}>
												<a>
													<Tooltip label={`(${row.first_name} ${row.last_name})`}>
														<Text variant="link">{row.username}</Text>
													</Tooltip>
												</a>
											</Link>
										</td>
										<td>{row.role.join(", ")}</td>
										<td>
											{row.group && row.group.length > 0
												? row.group.map((group, i) => {
														return (
															<Tooltip label={group.description} key={i} offset={-30}>
																<span>
																	<Link href={`group?qAll=${group.name}`}>
																		<a>
																			<Text variant="link">{group.name}</Text>
																		</a>
																	</Link>
																</span>
															</Tooltip>
														);
												  })
												: "Not a part of any group"}
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
