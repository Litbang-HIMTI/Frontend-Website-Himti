import type { NextPage } from "next";
import Link from "next/link";
import { Button, Center, createStyles, Divider, Group, LoadingOverlay, Paper, SimpleGrid, Text, Tooltip } from "@mantine/core";
import { IconNotebook, IconHistory, IconCalendarEvent, IconMessage, IconMessages, IconLink, IconRefresh, IconChartPie, IconExternalLink } from "@tabler/icons";
import { useEffect, useState } from "react";
import { emptyStats, IstatsExtended } from "../../../interfaces/db/Stats";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { SERVER_V1 } from "../../../utils/constants";
import { NoteDragDrop } from "./NoteDragDrop";

const useStyles = createStyles((theme) => ({
	root: {
		padding: theme.spacing.xl * 1.5,
	},

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

const formatBytes = (bytes: number, decimals = 2) => {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const dataElProps = [
	{ name: "blog", icon: IconNotebook, fetchLink: "/blog/stats" },
	{ name: "blog_revision", icon: IconHistory, fetchLink: "/blog/stats" },
	{ name: "event", icon: IconCalendarEvent, fetchLink: "/event/stats" },
	{ name: "event_revision", icon: IconHistory, fetchLink: "/event/stats" },
	{ name: "forum", icon: IconMessage, fetchLink: "/forum/stats" },
	{ name: "comment", icon: IconMessages, fetchLink: "/comment/stats" },
	{ name: "shortlink", icon: IconLink, fetchLink: "/shortlink/stats" },
];

export const DashboardHome: NextPage<IDashboardProps> = (props) => {
	const { classes } = useStyles();

	const [datas, setDatas] = useState<IstatsExtended[]>([emptyStats, emptyStats, emptyStats, emptyStats, emptyStats, emptyStats, emptyStats]);
	const [stats, setStats] = useState<JSX.Element[] | null>(null);

	const fetchDataFunc = async (index: number) => {
		if (index === 1 || index === 3) return; // dupe. blog_revision and event_revision is returned in the same route. Index Refer to dataElProps

		try {
			const fetched = await fetch(SERVER_V1 + dataElProps[index].fetchLink, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			if (fetched.status !== 200)
				return setDatas((prev) => {
					const newDatas = [...prev];
					newDatas[index].loading = false;
					newDatas[index].loadFail = true;
					return newDatas;
				});

			const { data } = await fetched.json();
			setDatas((prev) => {
				const newData = [...prev];

				// check dupe. blog_revision and event_revision is returned in the same route as array. Index Refer to dataElProps
				if (index === 0 || index === 2) {
					newData[index] = data[0] as IstatsExtended;
					newData[index].loading = false;

					newData[index + 1] = data[1] as IstatsExtended;
					newData[index + 1].loading = false;
				} else {
					newData[index] = data as IstatsExtended;
					newData[index].loading = false;
				}

				return newData;
			});

			// *Shortlink get click counts
			// ! THIS IS NOT REALLY A GOOD METHOD TO DO IT.
			// For example, we can add an extra callback methods in the dataElProps, but since there is only 1 here and it is not really a problem, I will leave it like this.
			// if for future expand or improvement, you should add extra callback methods in the dataElProps.
			if (dataElProps[index].name === "shortlink") {
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
					setDatas((prev) => {
						const newData = [...prev];
						newData[index].extraData = "Total click : " + extraJson.data.clickCount;
						return newData;
					});
				}
			}
		} catch (err) {
			return setDatas((prev) => {
				const newDatas = [...prev];
				newDatas[index].loading = false;
				newDatas[index].loadFail = true;
				return newDatas;
			});
		}
	};

	useEffect(() => {
		const statsFill = datas.map((data, i) => {
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
		});

		setStats(statsFill);

		// fill data by looping
		for (let i = 0; i < datas.length; i++) if (datas[i].loading) fetchDataFunc(i);
	}, [datas, classes.diff, classes.icon, classes.title, classes.value]);

	return (
		<>
			<div className={classes.root} style={{ paddingBottom: "1rem" }}>
				<h1>Welcome {props.user ? props.user.username : null}</h1>
			</div>
			<Center>
				<div className={classes.root}>
					<SimpleGrid
						cols={5}
						breakpoints={[
							{ maxWidth: "lg", cols: 3 },
							{ maxWidth: "md", cols: 2 },
							{ maxWidth: "xs", cols: 1 },
						]}
					>
						{stats && stats.length > 0 ? stats : null}

						<Paper withBorder p="md" radius="md">
							<Group position="apart">
								<Text size="xs" color="dimmed" className={classes.title}>
									{/* {dataElProps[i].name.replaceAll("_", " ")} */}
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
