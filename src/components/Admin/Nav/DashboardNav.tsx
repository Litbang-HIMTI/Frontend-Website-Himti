import type { NextPage } from "next";
import { useState } from "react";
import { Navbar, Center, Tooltip, UnstyledButton, createStyles, Stack, useMantineColorScheme } from "@mantine/core";
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
	onClick?(): void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
	const { classes, cx } = useStyles();
	return (
		<Tooltip label={label} position="right" transitionDuration={0}>
			<UnstyledButton onClick={onClick} className={cx(classes.link, { [classes.active]: active })}>
				<Icon stroke={1.5} />
			</UnstyledButton>
		</Tooltip>
	);
}

const mockdata = [
	{ icon: IconDashboard, label: "Dashboard Home", path: "/admin", validate: validateStaff },
	{ icon: IconNotebook, label: "Blog", path: "/admin/blog", validate: validateEditor },
	{ icon: IconCalendarEvent, label: "Event", path: "/admin/event", validate: validateEditor },
	{ icon: IconMessage, label: "Forum", path: "/admin/forum", validate: validateForumMod },
	{ icon: IconMessages, label: "Comment", path: "/admin/comment", validate: validateForumMod },
	{ icon: IconLink, label: "Shortlink", path: "/admin/shortlink", validate: validateShortlinkMod },
	{ icon: IconNote, label: "Note", path: "/admin/note", validate: validateStaff },
	{ icon: IconUser, label: "User", path: "/admin/user", validate: validateAdmin },
	{ icon: IconUsers, label: "Group", path: "/admin/group", validate: validateAdmin },
];

interface navProps {
	pathname?: string;
	user?: IUser;
}

export const DashboardNav: NextPage<navProps> = (props) => {
	const [active, setActive] = useState(mockdata.findIndex((data) => data.path === props.pathname));
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();

	const links = mockdata.map((link, index) => (
		<>
			{link.validate(props.user!) && (
				<Link href={link.path} key={link.label}>
					<a>
						<NavbarLink onClick={() => setActive(index)} {...link} key={link.label} active={index === active} />
					</a>
				</Link>
			)}
		</>
	));

	return (
		<Navbar width={{ base: 80 }} p="md">
			<Center>
				<UserPopout {...props} />
			</Center>
			<Navbar.Section grow mt={50}>
				<Stack justify="center" spacing={0}>
					{links}
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
