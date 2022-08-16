import { Button, Center, Modal } from "@mantine/core";

interface deleteI {
	opened: boolean;
	closeFunc: (tf: boolean) => void;
	deleteFunc: (toDel: string) => void;
	idDelete: string;
}

export const MDelete = ({ opened, closeFunc, deleteFunc, idDelete }: deleteI) => {
	return (
		<Modal opened={opened} onClose={() => closeFunc(false)} title="Are you sure?">
			<Center>
				<p>This action cannot be undone.</p>
			</Center>

			<Center>
				<Button onClick={() => closeFunc(false)} m={16}>
					No, Cancel
				</Button>
				<Button onClick={() => deleteFunc(idDelete)} m={16} color="red">
					Yes, Delete
				</Button>
			</Center>
		</Modal>
	);
};

interface confirmI {
	opened: boolean;
	closeFunc: () => void;
	confirmFunc: () => void;
}

export const MConfirmContinue = ({ opened, closeFunc, confirmFunc }: confirmI) => {
	return (
		<Modal opened={opened} onClose={closeFunc} title="Are you sure?">
			<Center>
				<p>This action cannot be undone.</p>
			</Center>

			<Center>
				<Button onClick={closeFunc} m={16}>
					No, Cancel
				</Button>
				<Button onClick={confirmFunc} m={16} color="red">
					Yes, Continue
				</Button>
			</Center>
		</Modal>
	);
};
