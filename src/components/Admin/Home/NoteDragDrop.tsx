import { useEffect, useState } from "react";
import { NextPage } from "next";
import { createStyles, Text } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { IconGripVertical } from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";

const useStyles = createStyles((theme) => ({
	item: {
		display: "flex",
		alignItems: "center",
		borderRadius: theme.radius.md,
		border: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]}`,
		padding: `${theme.spacing.sm}px ${theme.spacing.xl}px`,
		paddingLeft: theme.spacing.xl - theme.spacing.md, // to offset drag handle
		backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.white,
		marginBottom: theme.spacing.sm,
	},

	itemDragging: {
		boxShadow: theme.shadows.sm,
	},

	symbol: {
		fontSize: 30,
		fontWeight: 700,
		width: 60,
	},

	dragHandle: {
		...theme.fn.focusStyles(),
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		height: "100%",
		color: theme.colorScheme === "dark" ? theme.colors.dark[1] : theme.colors.gray[6],
		paddingLeft: theme.spacing.md,
		paddingRight: theme.spacing.md,
	},
}));

interface DndListHandleProps {
	position: number;
	mass: number;
	symbol: string;
	name: string;
}

export const NoteDragDrop: NextPage<IDashboardProps> = (props) => {
	const data: DndListHandleProps[] = [
		{
			position: 6,
			mass: 12.011,
			symbol: "C",
			name: "Carbon",
		},
		{
			position: 7,
			mass: 14.007,
			symbol: "N",
			name: "Nitrogen",
		},
		{
			position: 39,
			mass: 88.906,
			symbol: "Y",
			name: "Yttrium",
		},
		{
			position: 56,
			mass: 137.33,
			symbol: "B",
			name: "Barium",
		},
		{
			position: 58,
			mass: 140.12,
			symbol: "Z",
			name: "Cerium",
		},
	];

	const { classes, cx } = useStyles();
	const [state, handlers] = useListState(data);
	const [items, setItems] = useState<JSX.Element[] | null>(null);

	useEffect(() => {
		const itemList = state.map((item, index) => (
			<Draggable index={index} draggableId={item.symbol} key={item.symbol}>
				{(provided, snapshot) => (
					<div className={cx(classes.item, { [classes.itemDragging]: snapshot.isDragging })} ref={provided.innerRef} {...provided.draggableProps}>
						<div {...provided.dragHandleProps} className={classes.dragHandle}>
							<IconGripVertical size={18} stroke={1.5} />
						</div>
						<Text className={classes.symbol}>{item.symbol}</Text>
						<div>
							<Text>{item.name}</Text>
							<Text color="dimmed" size="sm">
								Position: {item.position} • Mass: {item.mass}
							</Text>
						</div>
					</div>
				)}
			</Draggable>
		));

		setItems(itemList);
	}, []);

	return (
		<DragDropContext onDragEnd={({ destination, source }) => handlers.reorder({ from: source.index, to: destination?.index || 0 })}>
			<Droppable droppableId="dnd-list" direction="vertical">
				{(provided) => (
					<div {...provided.droppableProps} ref={provided.innerRef}>
						{items ? items : <Text>No items</Text>}
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
};
