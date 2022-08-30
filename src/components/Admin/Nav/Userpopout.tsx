import { NextPage } from "next";
import Link from "next/link";
import { Menu, Group, Text, ActionIcon, MantineTheme } from "@mantine/core";
import { IconLogout, IconSettings, IconChevronRight, IconDots, IconUser, IconNotebook, IconCalendarEvent, IconMessage, IconMessages } from "@tabler/icons";
import { IUser } from "../../../interfaces/db/User";
import { validateEditor, validateForumMod, validateAdmin } from "../../../helper/global/role";

interface navProps {
	pathname?: string;
	theme: MantineTheme;
	user?: IUser;
}

export const UserPopout: NextPage<navProps> = (props) => {
	const { theme } = props;
	return (
		<Group position="center" mt={3}>
			<Menu width={300} position="right" transition="pop" trigger="hover">
				<Menu.Target>
					<ActionIcon size={50} sx={{ display: "flex", flexDirection: "column" }}>
						<IconUser size={30} type="mark" />
						<IconDots size={16} stroke={1.5} />
					</ActionIcon>
				</Menu.Target>
				<Menu.Dropdown>
					{validateAdmin(props.user!) ? (
						<Link href={`/${props.pathname?.split("/")[1]}/user/${props.user?._id}`}>
							<a>
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
							</a>
						</Link>
					) : (
						<Menu.Item>
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
					)}

					<Menu.Divider />

					{validateEditor(props.user!) && (
						<>
							<Link href={`/${props.pathname?.split("/")[1]}/blog?author=${props.user?.username}&tab=1`}>
								<a>
									<Menu.Item icon={<IconNotebook size={14} stroke={1.5} color={theme.colors.red[6]} />}>Your Blog Posts</Menu.Item>
								</a>
							</Link>
							<Link href={`/${props.pathname?.split("/")[1]}/event?author=${props.user?.username}&tab=1`}>
								<a>
									<Menu.Item icon={<IconCalendarEvent size={14} stroke={1.5} color={theme.colors.yellow[6]} />}>Your Event Posts</Menu.Item>
								</a>
							</Link>
						</>
					)}

					{validateForumMod(props.user!) && (
						<>
							<Link href={`/${props.pathname?.split("/")[1]}/forum?author=${props.user?.username}&tab=1`}>
								<a>
									<Menu.Item icon={<IconMessage size={14} stroke={1.5} color={theme.colors.blue[6]} />}>Your Forum Posts</Menu.Item>
								</a>
							</Link>
						</>
					)}

					<Link href={`/${props.pathname?.split("/")[1]}/comment?author=${props.user?.username}&tab=1`}>
						<a>
							<Menu.Item icon={<IconMessages size={14} stroke={1.5} color={theme.colors.blue[6]} />}>Your comments</Menu.Item>
						</a>
					</Link>

					<Menu.Label>Settings</Menu.Label>
					{validateAdmin(props.user!) && (
						<Link href={`/${props.pathname?.split("/")[1]}/user/${props.user?.username}`}>
							<a>
								<Menu.Item icon={<IconSettings size={14} stroke={1.5} />}>Account settings</Menu.Item>
							</a>
						</Link>
					)}
					<Link href="/auth/logout">
						<a id="logout-popout">
							<Menu.Item icon={<IconLogout size={14} stroke={1.5} />}>Logout</Menu.Item>
						</a>
					</Link>
				</Menu.Dropdown>
			</Menu>
		</Group>
	);
};
