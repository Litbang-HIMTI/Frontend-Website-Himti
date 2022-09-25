import React, { useContext } from "react";

type toggleNavigationType = {
	isOpen: boolean;
	toggleNavigation: () => void;
	closeNavigation: () => void;
};

type Props = {
	children: React.ReactNode;
};

const toggleNavigationDefault: toggleNavigationType = {
	isOpen: false,
	toggleNavigation: () => {},
	closeNavigation: () => {},
};

// Navigation context
const NavigationContext = React.createContext<toggleNavigationType>(toggleNavigationDefault);

export function useToggleNavbar() {
	return useContext(NavigationContext);
}

//  Provider
export function NavigationProvider({ children }: Props) {
	const [isOpen, setIsOpen] = React.useState<boolean>(false);

	const toggleNavigation = () => {
		setIsOpen(!isOpen);
	};

	const closeNavigation = () => {
		setIsOpen(false);
	};

	const value = {
		isOpen,
		toggleNavigation,
		closeNavigation,
	};

	return (
		<>
			<NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
		</>
	);
}
