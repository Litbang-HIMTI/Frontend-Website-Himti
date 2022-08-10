import { Menu, Group, Text, useMantineTheme, ActionIcon } from "@mantine/core";
import { IconLogout, IconNotebook, IconCalendarEvent, IconMessage, IconSettings, IconMessages, IconChevronRight, IconDots, IconUser } from "@tabler/icons";
import { NextPage } from "next";
import { IUser } from "../../../interfaces/User";

interface navProps {
	pathname?: string;
	user?: IUser;
}

export const UserPopout: NextPage<navProps> = (props) => {
	const theme = useMantineTheme();
	return (
		<Group position="center">
			<Menu withArrow width={300} position="right" transition="pop">
				{/*  trigger="hover" */}
				<Menu.Target>
					<ActionIcon size={50} sx={{ display: "flex", flexDirection: "column" }}>
						<IconUser size={30} type="mark" />
						<IconDots size={16} stroke={1.5} />
					</ActionIcon>
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Item rightSection={<IconChevronRight size={14} stroke={1.5} />}>
						<Group>
							<div>
								<Text weight={500}>{props.user?.username!}</Text>
								<Text size="xs" component="span">
									({props.user?.first_name!} {props.user?.last_name!})
								</Text>
								<Text mt="xs" size="xs" color="dimmed">
									{props.user?.role!.join(", ")} ‒ {props.user?.email!}
								</Text>
							</div>
						</Group>
					</Menu.Item>

					<Menu.Divider />

					<Menu.Item icon={<IconNotebook size={14} stroke={1.5} color={theme.colors.red[6]} />}>Your Blog Posts</Menu.Item>
					<Menu.Item icon={<IconCalendarEvent size={14} stroke={1.5} color={theme.colors.yellow[6]} />}>Your Events</Menu.Item>
					<Menu.Item icon={<IconMessage size={14} stroke={1.5} color={theme.colors.blue[6]} />}>Your Forum Posts</Menu.Item>
					<Menu.Item icon={<IconMessages size={14} stroke={1.5} color={theme.colors.blue[6]} />}>Your comments</Menu.Item>

					<Menu.Label>Settings</Menu.Label>
					<Menu.Item icon={<IconSettings size={14} stroke={1.5} />}>Account settings</Menu.Item>
					<Menu.Item icon={<IconLogout size={14} stroke={1.5} />}>Logout</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</Group>
	);
};
