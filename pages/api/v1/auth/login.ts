import type { NextApiRequest, NextApiResponse } from "next";
import { SERVER_V1 } from "../../../../src/utils/constants";

type Data = {
	data: any;
	message: string;
	success: boolean;
};

interface ExtendedNextApiRequest extends NextApiRequest {
	body: {
		username: string;
		password: string;
	};
}

export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse<Data>) {
	if (req.method !== "POST") return res.status(405).send({ data: null, message: "Only POST requests allowed", success: false });

	const { username, password } = req.body;
	const loginFetch = await fetch(`${SERVER_V1}/auth`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username,
			password,
		}),
	});

	const setCookie = loginFetch.headers.get("set-cookie");
	if (setCookie) res.setHeader("set-cookie", setCookie);

	const loginData = await loginFetch.json();
	return res.status(loginFetch.status).json(loginData);

	// res.status(200).json(await loginFetch.json());
}
