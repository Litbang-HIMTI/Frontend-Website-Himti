import type { NextPage } from "next";
import Link from "next/link";
import { Button, Center, createStyles, Divider, Group, LoadingOverlay, Paper, SimpleGrid, Text, Tooltip } from "@mantine/core";
import { IconNotebook, IconHistory, IconCalendarEvent, IconMessage, IconMessages, IconLink, IconRefresh, IconChartPie, IconExternalLink } from "@tabler/icons";
import { useEffect, useState } from "react";
import { NoteDragDrop } from "./NoteDragDrop";
import { TitleDashboard } from "../../Utils/Dashboard";
import { emptyStats, IstatsExtended } from "../../../interfaces/db/Stats";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { formatBytes, SERVER_V1 } from "../../../helper";

const useStyles = createStyles((theme) => ({
	value: {
		fontSize: 24,
		fontWeight: 700,
		lineHeight: 1,
	},

	diff: {
		lineHeight: 1,
		display: "flex",
		alignItems: "center",
	},

	icon: {
		color: theme.colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.gray[4],
	},

	title: {
		fontWeight: 700,
		textTransform: "uppercase",
	},
}));

export const DashboardHome: NextPage<IDashboardProps> = (props) => {
	const { classes } = useStyles();
	const [statsData, setStatsData] = useState<IstatsExtended[]>([emptyStats, emptyStats, emptyStats, emptyStats, emptyStats, emptyStats, emptyStats]);

	// ---------------------------------------------------------------------------------------------
	const fetchShortlinkClicks = async (index: number) => {
		try {
			const extraData = await fetch(SERVER_V1 + dataElProps[index].fetchLink.replace("stats", "clickCounts"), {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			if (extraData.status === 200) {
				const extraJson = await extraData.json();

				// index 6 shortlink
				setStatsData((prev) => {
					const newData = [...prev];
					newData[index].loading = false;
					newData[index].extraData = "Total click : " + extraJson.data.clickCount;
					return newData;
				});
			}
		} catch (error) {
			setStatsData((prev) => {
				const newDatas = [...prev];
				newDatas[index].loading = false;
				newDatas[index].extraData = "Total click : fail to load!";
				newDatas[index].loadFail = true;
				return newDatas;
			});
		}
	};

	const dataElProps = [
		{ name: "blog", icon: IconNotebook, fetchLink: "/blog/stats" },
		{ name: "blog_revision", icon: IconHistory, skipFetch: true, fetchLink: "/blog/stats" },
		{ name: "event", icon: IconCalendarEvent, fetchLink: "/event/stats" },
		{ name: "event_revision", icon: IconHistory, skipFetch: true, fetchLink: "/event/stats" },
		{ name: "forum", icon: IconMessage, fetchLink: "/forum/stats" },
		{ name: "comment", icon: IconMessages, fetchLink: "/comment/stats" },
		{ name: "shortlink", icon: IconLink, fetchLink: "/shortlink/stats", extraFunc: fetchShortlinkClicks },
	];

	const fetchDataFunc = async (index: number) => {
		if (dataElProps[index].skipFetch) return; // skip dupe. blog_revision and event_revision is returned in the same route. Index Refer to dataElProps

		try {
			const fetched = await fetch(SERVER_V1 + dataElProps[index].fetchLink, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			if (fetched.status !== 200)
				return setStatsData((prev) => {
					const newDatas = [...prev];
					newDatas[index].loading = false;
					newDatas[index].loadFail = true;
					return newDatas;
				});

			const { data } = await fetched.json();
			setStatsData((prev) => {
				const newData = [...prev];

				// check if next is skipped, skipped because data is returned in the same route as the previous
				if (dataElProps[index + 1] && dataElProps[index + 1].skipFetch) {
					newData[index] = data[0] as IstatsExtended;
					newData[index].loading = false;

					newData[index + 1] = data[1] as IstatsExtended;
					newData[index + 1].loading = false;
				} else {
					newData[index] = data as IstatsExtended;
					if (!dataElProps[index].extraFunc) newData[index].loading = false;
					if (dataElProps[index].name === "shortlink") newData[index].extraData = "Total click : loading...";
				}

				return newData;
			});

			// fetch extra data (total click short link)
			// you can add more by adding extraFunc in dataElProps
			if (dataElProps[index].extraFunc) dataElProps[index].extraFunc!(index);
		} catch (err) {
			setStatsData((prev) => {
				const newDatas = [...prev];
				newDatas[index].loading = false;
				newDatas[index].loadFail = true;
				return newDatas;
			});
		}
	};

	useEffect(() => {
		for (let i = 0; i < statsData.length; i++) if (statsData[i].loading) fetchDataFunc(i); // fill data by looping
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<TitleDashboard title={`Welcome ${props.user ? props.user.username : ""}`} mb="2rem" />
			<Center>
				<div>
					<SimpleGrid
						cols={5}
						breakpoints={[
							{ maxWidth: "lg", cols: 3 },
							{ maxWidth: "md", cols: 2 },
							{ maxWidth: "xs", cols: 1 },
						]}
					>
						{statsData.map((data, i) => {
							const IconProps = dataElProps[i].icon;
							return (
								<Paper withBorder p="md" radius="md" key={i}>
									<Group position="apart">
										<Text size="xs" color="dimmed" className={classes.title}>
											{dataElProps[i].name.replaceAll("_", " ")}
										</Text>
										<IconProps className={classes.icon} size={22} stroke={1.5} />
									</Group>

									<div style={{ position: "relative" }}>
										<LoadingOverlay overlayBlur={2} visible={data.loading} zIndex={1} />
										{!data.loadFail ? (
											<>
												<Group align="flex-end" spacing="xs" mt={25}>
													<Text className={classes.value}>{data.count} documents</Text>
													<Text color={"teal"} size="sm" weight={500} className={classes.diff}>
														<span>{formatBytes(data.size)} (usage)</span>
													</Text>
												</Group>

												<Text size="xs" color="dimmed" mt={7}>
													<Tooltip label="(Pre) allocated space for the collection" color="blue" transition="pop" withArrow>
														<span>Total index size: {formatBytes(data.storageSize)}</span>
													</Tooltip>
													<br />
													Average: {data.avgObjSize ? formatBytes(data.avgObjSize) : "0 Bytes"}
													<br />
													{data.extraData ? data.extraData : null}
												</Text>
											</>
										) : (
											<>
												<Group align="flex-end" spacing="xs" mt={25}>
													<Text className={classes.value}>Fetch Error</Text>
													<Text color={"red"} size="sm" weight={500} className={classes.diff}>
														<span>Fail to load</span>
													</Text>
												</Group>

												<Text size="xs" color="red" mt={7}>
													Error loading data
												</Text>

												<Button mt={24} fullWidth leftIcon={<IconRefresh />} compact onClick={() => fetchDataFunc(i)}>
													Refresh
												</Button>
											</>
										)}
									</div>
								</Paper>
							);
						})}

						<Paper withBorder p="md" radius="md">
							<Group position="apart">
								<Text size="xs" color="dimmed" className={classes.title}>
									Web analytics
								</Text>
								<IconChartPie className={classes.icon} size={22} stroke={1.5} />
							</Group>

							<div style={{ position: "relative" }}>
								<Group align="flex-end" spacing="xs" mt={25}>
									<Text className={classes.value}>Provided by Umami</Text>
									<Text color={"teal"} size="sm" weight={500} className={classes.diff}>
										<span>Visitor Insights, Realtime Data, etc.</span>
									</Text>
								</Group>

								<Link href={"#"} target={"_blank"}>
									<Button mt={24} fullWidth leftIcon={<IconExternalLink />} compact>
										Visit
									</Button>
								</Link>
							</div>
						</Paper>
					</SimpleGrid>

					<Divider mt={16} mb={16} />

					<NoteDragDrop {...props} />
				</div>
			</Center>
		</>
	);
};
