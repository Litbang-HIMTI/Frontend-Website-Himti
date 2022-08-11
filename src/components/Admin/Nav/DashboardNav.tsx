import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { Navbar, Center, Tooltip, UnstyledButton, createStyles, Stack, useMantineColorScheme, Menu, ActionIcon, useMantineTheme, MantineTheme, LoadingOverlay } from "@mantine/core";
import {
	IconSun,
	IconMoonStars,
	TablerIcon,
	IconHome2,
	IconNotebook,
	IconLink,
	IconCalendarEvent,
	IconUser,
	IconUsers,
	IconNote,
	IconLogout,
	IconMessage,
	IconMessages,
	IconDashboard,
	IconCirclePlus,
	IconTags,
	IconList,
	IconAffiliate,
	IconId,
} from "@tabler/icons";
import Link from "next/link";
import { IUser } from "../../../interfaces/User";
import { UserPopout } from "./Userpopout";
import { validateAdmin, validateEditor, validateForumMod, validateShortlinkMod, validateStaff } from "../../../utils/helper";

const useStyles = createStyles((theme) => ({
	link: {
		width: 50,
		height: 50,
		borderRadius: theme.radius.md,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.gray[7],

		"&:hover": {
			backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[0],
		},
	},

	active: {
		"&, &:hover": {
			backgroundColor: theme.fn.variant({ variant: "light", color: theme.primaryColor }).background,
			color: theme.fn.variant({ variant: "light", color: theme.primaryColor }).color,
		},
	},
}));

interface NavbarLinkProps {
	icon: TablerIcon;
	label: string;
	active?: boolean;
	disabled?: boolean;
	onClick?(): void;
}

const NavbarLink = ({ icon: Icon, label, active, disabled, onClick }: NavbarLinkProps) => {
	const { classes, cx } = useStyles();
	return (
		<Tooltip label={label} position="right" transitionDuration={0} disabled={disabled || false}>
			<div onClick={onClick} className={cx(classes.link, { [classes.active]: active })}>
				<Icon stroke={1.5} />
			</div>
		</Tooltip>
	);
};

interface navProps {
	pathname?: string;
	user?: IUser;
}

const blogMenu = (_props: navProps, theme: MantineTheme, _type: string) => {
	return (
		<Menu.Dropdown>
			<Menu.Label>Blog</Menu.Label>
			<Link href={`/admin/blog`}>
				<a>
					<Menu.Item icon={<IconList size={14} stroke={1.5} color={theme.colors.grape[6]} />}>Blog posts</Menu.Item>
				</a>
			</Link>
			<Link href={`/admin/blog/create`}>
				<a>
					<Menu.Item icon={<IconCirclePlus size={14} stroke={1.5} color={theme.colors.red[6]} />}>Create new post</Menu.Item>
				</a>
			</Link>
			<Link href={`/admin/blog/tags`}>
				<a>
					<Menu.Item icon={<IconTags size={14} stroke={1.5} color={theme.colors.yellow[6]} />}>Tags</Menu.Item>
				</a>
			</Link>
		</Menu.Dropdown>
	);
};

const eventMenu = (_props: navProps, theme: MantineTheme, _type: string) => {
	return (
		<Menu.Dropdown>
			<Menu.Label>Event</Menu.Label>
			<Link href={`/admin/event`}>
				<a>
					<Menu.Item icon={<IconList size={14} stroke={1.5} color={theme.colors.grape[6]} />}>Events</Menu.Item>
				</a>
			</Link>
			<Link href={`/admin/event/create`}>
				<a>
					<Menu.Item icon={<IconCirclePlus size={14} stroke={1.5} color={theme.colors.red[6]} />}>Create new Event</Menu.Item>
				</a>
			</Link>
			<Link href={`/admin/event/tags`}>
				<a>
					<Menu.Item icon={<IconTags size={14} stroke={1.5} color={theme.colors.yellow[6]} />}>Tags</Menu.Item>
				</a>
			</Link>
			<Link href={`/admin/event/organizer`}>
				<a>
					<Menu.Item icon={<IconAffiliate size={14} stroke={1.5} color={theme.colors.teal[6]} />}>Organizer</Menu.Item>
				</a>
			</Link>
		</Menu.Dropdown>
	);
};

const forumMenu = (_props: navProps, theme: MantineTheme, _type: string) => {
	return (
		<Menu.Dropdown>
			<Menu.Label>Forum</Menu.Label>
			<Link href={`/admin/forum`}>
				<a>
					<Menu.Item icon={<IconList size={14} stroke={1.5} color={theme.colors.grape[6]} />}>Forum Posts</Menu.Item>
				</a>
			</Link>
			<Link href={`/admin/forum/create`}>
				<a>
					<Menu.Item icon={<IconCirclePlus size={14} stroke={1.5} color={theme.colors.red[6]} />}>Create new Event</Menu.Item>
				</a>
			</Link>
			<Link href={`/admin/forum/category`}>
				<a>
					<Menu.Item icon={<IconId size={14} stroke={1.5} color={theme.colors.cyan[6]} />}>Category</Menu.Item>
				</a>
			</Link>
		</Menu.Dropdown>
	);
};

const genericMenu = (_props: navProps, theme: MantineTheme, type: string) => {
	return (
		<Menu.Dropdown>
			<Menu.Label>{type}</Menu.Label>
			<Link href={`/admin/${type.toLowerCase()}`}>
				<a>
					<Menu.Item icon={<IconList size={14} stroke={1.5} color={theme.colors.grape[6]} />}>{type}s</Menu.Item>
				</a>
			</Link>
			<Link href={`/admin/${type.toLowerCase()}/create`}>
				<a>
					<Menu.Item icon={<IconCirclePlus size={14} stroke={1.5} color={theme.colors.red[6]} />}>Create new {type}</Menu.Item>
				</a>
			</Link>
		</Menu.Dropdown>
	);
};

const navData = [
	{ icon: IconDashboard, label: "Dashboard Home", path: "/admin", validate: validateStaff, disabled: false },
	{ icon: IconNotebook, label: "Blog", path: "/admin/blog", validate: validateEditor, menuItem: blogMenu, disabled: true },
	{ icon: IconCalendarEvent, label: "Event", path: "/admin/event", validate: validateEditor, menuItem: eventMenu, disabled: true },
	{ icon: IconMessage, label: "Forum", path: "/admin/forum", validate: validateForumMod, menuItem: forumMenu, disabled: true },
	{ icon: IconMessages, label: "Comment", path: "/admin/comment", validate: validateForumMod, disabled: false },
	{ icon: IconLink, label: "Shortlink", path: "/admin/shortlink", validate: validateShortlinkMod, menuItem: genericMenu, disabled: true },
	{ icon: IconNote, label: "Note", path: "/admin/note", validate: validateStaff, menuItem: genericMenu, disabled: true },
	{ icon: IconUser, label: "User", path: "/admin/user", validate: validateAdmin, menuItem: genericMenu, disabled: true },
	{ icon: IconUsers, label: "Group", path: "/admin/group", validate: validateAdmin, menuItem: genericMenu, disabled: true },
];

export const DashboardNav: NextPage<navProps> = (props) => {
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();
	const [active, setActive] = useState(navData.findIndex((data) => data.path === props.pathname));
	const [links, setLinks] = useState<JSX.Element[] | null>(null);

	useEffect(() => {
		setLinks(
			navData.map((link, index) => {
				if (link.validate(props.user!))
					return (
						<Menu width={300} position="right" transition="pop" trigger="hover" key={link.path}>
							<Link href={link.path}>
								<a>
									<Menu.Target>
										<ActionIcon size={50} sx={{ display: "flex", flexDirection: "column" }}>
											<NavbarLink onClick={() => setActive(index)} {...link} active={index === active} />
										</ActionIcon>
									</Menu.Target>
								</a>
							</Link>
							{link.menuItem ? link.menuItem(props, theme, link.label) : null}
						</Menu>
					);
				else return <></>;
			})
		);
	}, [props.user, theme]);

	return (
		<Navbar width={{ base: 80 }} p="md">
			<Center>
				<UserPopout {...props} theme={theme} />
			</Center>
			<Navbar.Section grow mt={50}>
				<Stack justify="center" spacing={0}>
					{links ? links : <LoadingOverlay overlayBlur={2} visible={true} />}
				</Stack>
			</Navbar.Section>
			<Navbar.Section>
				<Stack justify="center" spacing={0}>
					<NavbarLink
						onClick={() => toggleColorScheme()}
						icon={colorScheme === "dark" ? IconSun : IconMoonStars}
						label={`Switch theme to ${colorScheme === "dark" ? "light" : "dark"} mode`}
					/>
					<Link href="/auth/logout">
						<a id="logout-nav">
							<NavbarLink icon={IconLogout} label="Logout" />
						</a>
					</Link>
					<Link href="/">
						<a>
							<NavbarLink icon={IconHome2} label="Go to home page" />
						</a>
					</Link>
				</Stack>
			</Navbar.Section>
		</Navbar>
	);
};
