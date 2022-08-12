import type { NextPage } from "next";
import { Button, Center, createStyles, Group, LoadingOverlay, Paper, SimpleGrid, Text, Tooltip } from "@mantine/core";
import { IconNotebook, IconHistory, IconCalendarEvent, IconMessage, IconMessages, IconLink, IconRefresh } from "@tabler/icons";
import { useEffect, useState } from "react";
import { emptyStats, IstatsExtended } from "../../interfaces/db/Stats";
import { IDashboardProps } from "../../interfaces/props/Dashboard";
import { SERVER_V1 } from "../../utils/constants";

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
		if (index === 1 || index === 3) return; // dupe

		try {
			const fetched = await fetch(SERVER_V1 + dataElProps[index].fetchLink, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					// Cookie: "connect.sid=" + props.token,
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
	}, [datas]);

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
					</SimpleGrid>
				</div>
			</Center>
		</>
	);
};
