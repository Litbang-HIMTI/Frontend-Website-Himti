import ShortCrypt from "short-crypt";
const salt = "349780cdd5dd0471d823ef074e56806e";
const sc = new ShortCrypt(salt);

export function shortenUrl(url: string) {
	const encrypyedUrl = sc.encryptToURLComponent(url);
	return encrypyedUrl;
}

// decrypt shortened url
export function decryptUrl(url: string) {
	const decryptedUrl = sc.decryptURLComponent(url);
	return decryptedUrl;
}
