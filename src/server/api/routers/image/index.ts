import { imageUpdate } from "@cryptalbum/server/api/routers/image/imageUpdate";
import { createTRPCRouter } from "@cryptalbum/server/api/trpc";
import { deleteImage } from "./deleteImage";
import { getAlbumImages } from "./getAlbumImages";
import { getImageContent } from "./getImageContent";
import { getImages } from "./getImages";
import { upload } from "./upload";
import { sharePicture } from "./sharePicture";

export type AlbumSharedKeys = Array<{
	key: string;
	userId: string;
	deviceId: string;
	albumId: string;
}>;

export const imageRouter = createTRPCRouter({
	upload,
	getImages,
	getAlbumImages,
	getImageContent,
	delete: deleteImage,
	update: imageUpdate,
	sharePicture,
});
