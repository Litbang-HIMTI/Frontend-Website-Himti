import { Button, Center, Modal } from "@mantine/core";

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
