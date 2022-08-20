import type { NextApiRequest, NextApiResponse } from "next";
import cloudinary from "cloudinary";

export const config = {
	api: {
		bodyParser: {
			sizeLimit: "4mb", // Set desired value here
		},
	},
};
type Data = {
	message: string;
	success: boolean;
	data?: any;
};

// Local route to upload to Cloudinary
export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
	// must be a post request
	if (req.method !== "POST") {
		res.status(405).json({ message: "Method not allowed", success: false });
		return;
	}

	// must be authenticated, connect.sid cookie must be present
	if (!req.cookies["connect.sid"]) {
		res.status(401).json({ message: "Unauthorized", success: false });
		return;
	}

	cloudinary.v2.config({
		api_key: process.env.CLOUDINARY_API_KEY!,
		api_secret: process.env.CLOUDINARY_API_SECRET!,
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
		secure: true,
	});

	// parse body as json
	const body = JSON.parse(req.body);
	const image = body.file;

	const uploadRes = await cloudinary.v2.uploader.upload(image, {
		upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET!,
	});

	res.status(200).json({ message: "Success", success: true, data: uploadRes });
};
