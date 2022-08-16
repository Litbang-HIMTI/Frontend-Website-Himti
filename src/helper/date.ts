export const formatDateWithTz = (date: Date, tz: string) => {
	const d = new Date(date);
	return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} - ${d.toLocaleTimeString("en-us", { timeZone: tz })}`;
};
