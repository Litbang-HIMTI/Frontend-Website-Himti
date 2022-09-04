import type { NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UnstyledButton, Group, Text, TextInput, Tooltip, ActionIcon, Tabs, Collapse } from "@mantine/core";
import { keys } from "@mantine/utils";
import { useLocalStorage } from "@mantine/hooks";
import { IconSearch, IconEdit, IconTrash, IconUsers, IconLetterA, IconBriefcase, IconDeviceWatch } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { IUser, validUserSort, UserSort } from "../../../interfaces/db";
import { actionPrompt, fillDataPage, fillDataAll, handleAdminTabChange, handleInputQueryChange } from "../../../helper/admin";
import { formatDateWithTz } from "../../../helper/global/format";
import { Th, useTableStyles } from "../../Utils/Dashboard";
import { TableView } from "../Reusable/TableView";

export const User: NextPage<IDashboardProps> = (props) => {
	const { classes } = useTableStyles();
	const router = useRouter();
	const api_url = "user";

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
	const handleDelete = (id: string) => actionPrompt({ context: "user", _id: id, api_url, setDataPage, setDataAllPage });
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
			if (searchGroup !== "") dataPage = dataPage.filter((item) => item.group?.some((group) => group.name.toLowerCase().includes(searchGroup.toLowerCase())));
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
		fillDataPage(api_url, perPage, curPage, setLoadingDataPage, setCurPage, setPages, setDataPage);
		fillDataAll(api_url, setLoadingDataAll, setDataAllPage);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<TableView
				{...props}
				api_url={api_url}
				title={"Users"}
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
									placeholder="Search by username field"
									name="username"
									label="Username"
									icon={<IconLetterA size={14} stroke={1.5} />}
									value={searchUsername}
									onChange={(e) => handleInputQueryChange(e, setSearchUsername, e.target.name, router)}
									mt={16}
								/>
								<TextInput
									placeholder="Search by role field"
									name="role"
									label="Role"
									icon={<IconBriefcase size={14} stroke={1.5} />}
									value={searchRole}
									onChange={(e) => handleInputQueryChange(e, setSearchRole, e.target.name, router)}
									mt={8}
								/>
								<TextInput
									placeholder="Search by group field"
									name="group"
									label="Group"
									icon={<IconUsers size={14} stroke={1.5} />}
									value={searchGroup}
									onChange={(e) => handleInputQueryChange(e, setSearchGroup, e.target.name, router)}
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
							width="25%"
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
							width="25%"
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
												<Tooltip label={`(${row.first_name} ${row.last_name}) @ ${row.email}`}>
													<Text component="span" variant="link">
														{row.username}
													</Text>
												</Tooltip>
											</a>
										</Link>
									</td>
									<td>{row.role.join(", ")}</td>
									<td>
										{row.group && row.group.length > 0
											? row.group.map((group, i) => {
													return (
														<Tooltip label={group.description} key={i}>
															<span>
																<Link href={`group?qAll=${group.name}`}>
																	<a>
																		<Text component="span" variant="link">
																			{group.name}
																		</Text>
																	</a>
																</Link>
																{i < row.group!.length - 1 ? ", " : ""}
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
