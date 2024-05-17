import { imageUpdate } from "@cryptalbum/server/api/routers/image/imageUpdate";
import { createTRPCRouter } from "@cryptalbum/server/api/trpc";
import { deleteImage } from "./deleteImage";
import { getImageContent } from "./getImageContent";
import { getImages } from "./getImages";
import { upload } from "./upload";

export const imageRouter = createTRPCRouter({
	upload,
	getImages,
	getImageContent,
	delete: deleteImage,
	update: imageUpdate,
});
