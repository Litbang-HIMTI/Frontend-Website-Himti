import type { NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Table, ScrollArea, UnstyledButton, Group, Text, TextInput, ActionIcon, LoadingOverlay, Divider, Collapse } from "@mantine/core";
import { keys } from "@mantine/utils";
import { showNotification } from "@mantine/notifications";
import { IconSearch, IconExternalLink } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { IdCount, ValidIdCountSort, IdCountSort, IDCountQRes } from "../../../interfaces/db";
import { addQueryParam, removeQueryParam, SERVER_V1 } from "../../../helper";
import { Th, useTableStyles, TitleDashboard } from "../../Utils/Dashboard";

interface IdCountProps extends IDashboardProps {
	fetchLink?: string;
	title?: string;
	parent?: string;
	parentSearch?: string;
}

export const IdAndCount: NextPage<IdCountProps> = (props) => {
	const { classes } = useTableStyles();
	const router = useRouter();

	const [searchAll, setSearchAll] = useState("");
	const [dataAllPage, setDataAllPage] = useState<IdCount[]>([]);
	const [sortBy, setSortBy] = useState<ValidIdCountSort | null>(null);

	const [reverseSortDirection, setReverseSortDirection] = useState(false);
	const [loadingDataAll, setLoadingDataAll] = useState(true);

	// -----------------------------------------------------------
	// handler
	const handleInputQueryChange = (e: React.ChangeEvent<HTMLInputElement>, setFunc: (value: string) => void, param: string) => {
		setFunc(e.target.value);
		if (e.target.value === "") removeQueryParam(router, param);
		else addQueryParam(router, param, e.target.value);
	};

	// -----------------------------------------------------------
	// display
	const searchAllHelper = (item: IdCount, query: string) => {
		return item._id.toLowerCase().includes(query.toLowerCase()) || item.count.toString().includes(query.toLowerCase());
	};

	const searchData = (dataAll: IdCount[]) => {
		if (searchAll !== "") dataAll = dataAll.filter((item) => keys(dataAll[0]).some(() => searchAllHelper(item, searchAll)));
		return dataAll;
	};

	const sortSearchData = (type: ValidIdCountSort | null, dataAll: IdCount[]) => {
		if (!type) return searchData(dataAll);

		const sortMap: IdCountSort = {
			name: (a: IdCount, b: IdCount) => a._id.localeCompare(b._id),
			count: (a: IdCount, b: IdCount) => a.count - b.count,
		};

		// sort
		let sortedData = dataAll.sort(sortMap[type]);
		if (reverseSortDirection) sortedData.reverse();

		return searchData(sortedData);
	};

	// -----------------------------------------------------------
	// fetch
	const fillDataAll = async () => {
		try {
			setLoadingDataAll(true);
			const req = await fetch(SERVER_V1 + `${props.fetchLink}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			const { data, message }: IDCountQRes = await req.json();
			if (req.status !== 200) {
				setLoadingDataAll(false);
				return showNotification({ title: "Error fetching all data", message, color: "red" });
			}

			setDataAllPage(data);
			setLoadingDataAll(false);
		} catch (error: any) {
			setLoadingDataAll(false);
			showNotification({ title: "Error fetching all data", message: error.message, color: "red" });
		}
	};

	const fetchUrlParams = () => {
		const { query } = router;
		const params = new URLSearchParams(query as unknown as string);
		// set to local state
		setSearchAll(params.get("qAll") || "");
	};

	useEffect(() => {
		fetchUrlParams();
		fillDataAll();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<TitleDashboard title={props.title || "Loading..."} />

			<div className="dash-relative">
				<LoadingOverlay visible={loadingDataAll} overlayBlur={3} />
				<Collapse in={true}>
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
			</div>

			<Divider mt={16} mb={16} />

			<div className="dash-relative">
				<LoadingOverlay visible={loadingDataAll} overlayBlur={3} />
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
									width="40%"
								>
									Name
								</Th>
								<Th
									classes={classes}
									sorted={sortBy === "count"}
									reversed={reverseSortDirection}
									onSort={() => {
										if (sortBy === "count") setReverseSortDirection(!reverseSortDirection);
										setSortBy("count");
									}}
									width="30%"
								>
									Count
								</Th>
								<th className={classes.th} style={{ width: "30%" }}>
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
							{dataAllPage && dataAllPage.length > 0 && sortSearchData(sortBy, dataAllPage).length > 0 ? (
								sortSearchData(sortBy, dataAllPage).map((row) => (
									<tr key={row._id}>
										<td>
											<Link href={`../${props.parent}?tab=1&${props.parentSearch}=${row._id}`}>
												<a>
													<Text variant="link">{row._id}</Text>
												</a>
											</Link>
										</td>
										<td>{row.count}</td>
										<td style={{ padding: "1rem .5rem" }}>
											<div className="dash-flex">
												<Link href={`../${props.parent}?tab=1&${props.parentSearch}=${row._id}`}>
													<a>
														<ActionIcon>
															<IconExternalLink size={14} stroke={1.5} />
														</ActionIcon>
													</a>
												</Link>
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
