import type { NextPage } from "next";
import { NextRouter } from "next/router";
import { FC, SetStateAction } from "react";
import { Table, ScrollArea, Text, Center, Tabs, Button, LoadingOverlay, Divider, Collapse, NumberInput, TabsValue, Pagination } from "@mantine/core";
import { IconRefresh } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { handleAdminPageChange } from "../../../helper";
import { TitleDashboard } from "../../Utils/Dashboard";
import { fillDataPage, fillDataAll } from "../../../helper/admin/fetchData";

interface ITableView extends IDashboardProps {
	title: string;
	nonCreatable?: boolean;
	api_url: string;
	isSearching: boolean;
	router: NextRouter;
	// loading
	loadingDataAll: boolean;
	loadingDataPage: boolean;
	setLoadingDataAll: (value: SetStateAction<boolean>) => void;
	setLoadingDataPage: (value: SetStateAction<boolean>) => void;
	// page
	pages: number;
	curPage: number;
	perPage: number;
	setCurPage: (value: SetStateAction<number>) => void;
	setPerPage: (val: number | ((prevState: number) => number)) => void;
	setPages: (value: SetStateAction<number>) => void;
	// data
	setDataPage: (value: SetStateAction<any[]>) => void;
	setDataAllPage: (value: SetStateAction<any[]>) => void;
	// tabs
	tabIndex: number;
	handle_tabs_change: (value: TabsValue) => void;
	tabs_header_length: number;
	tabs_element_header: FC;
	tabs_element_body: FC;
	// table
	th_element: FC;
	tr_element: FC;
}

export const TableView: NextPage<ITableView> = (props) => {
	return (
		<>
			<TitleDashboard title={props.title} hrefLink={props.nonCreatable ? undefined : `${props.pathname?.split("?")[0]}/create`} hrefText="Add new" />

			<div>
				<Tabs value={props.tabIndex.toString() || "0"} onTabChange={props.handle_tabs_change}>
					<Tabs.List>
						{props.tabs_element_header(props)}
						<Tabs.Tab value={props.tabs_header_length.toString()} color="blue">
							Setting
						</Tabs.Tab>
					</Tabs.List>

					<div className="dash-relative">
						<LoadingOverlay visible={props.loadingDataAll} overlayBlur={3} />
						{props.tabs_element_body(props)}
					</div>

					<Tabs.Panel value={props.tabs_header_length.toString()} pt="xs" className="dash-textinput-gap">
						<Collapse in={props.tabIndex.toString() === props.tabs_header_length.toString()}>
							<Text color="dimmed">Customize data load setting</Text>
							<NumberInput
								label="Item per page"
								placeholder="Item per page"
								description="How many item per page in the dashboard (default: 25, min: 5, max: 100). Search is not affected by this setting."
								value={props.perPage}
								stepHoldDelay={500}
								stepHoldInterval={100}
								min={5}
								max={100}
								onChange={(value) => {
									if (!value) return;
									props.setPerPage(value);
								}}
								mt={8}
							/>

							<Button
								compact
								leftIcon={<IconRefresh size={20} />}
								onClick={() => {
									fillDataPage({
										api_url: props.api_url,
										perPage: props.perPage,
										curPageQ: props.curPage,
										setLoadingDataPage: props.setLoadingDataPage,
										setCurPage: props.setCurPage,
										setPages: props.setPages,
										setDataPage: props.setDataPage,
									});
									fillDataAll({ api_url: props.api_url, setLoadingDataAll: props.setLoadingDataAll, setDataAllPage: props.setDataAllPage });
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
				<LoadingOverlay visible={props.loadingDataPage} overlayBlur={3} />
				<ScrollArea mt={30}>
					<Table horizontalSpacing="md" verticalSpacing="xs" sx={{ tableLayout: "fixed", width: "100%" }} highlightOnHover>
						<thead>
							<tr>{props.th_element(props)}</tr>
						</thead>
						<tbody>{props.tr_element(props)}</tbody>
					</Table>
				</ScrollArea>
			</div>
			<Center mt={16}>
				{!props.isSearching && (
					<Pagination
						total={props.pages}
						page={props.curPage}
						onChange={(thePage) =>
							handleAdminPageChange(thePage, props.perPage, fillDataPage, props.router, props.api_url, props.setLoadingDataPage, props.setCurPage, props.setPages, props.setDataPage)
						}
					/>
				)}
			</Center>
		</>
	);
};
