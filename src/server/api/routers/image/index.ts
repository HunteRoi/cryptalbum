import { createTRPCRouter } from "@cryptalbum/server/api/trpc";
import { getImageContent } from "./getImageContent";
import { getImages } from "./getImages";
import { upload } from "./upload";

export const imageRouter = createTRPCRouter({
	upload,
	getImages,
	getImageContent,
});
