import { createTRPCRouter } from "../../trpc";
import { create } from "./create";
import { deleteAlbum } from "./deleteAlbum";
import { getAlbum } from "./getAlbum";
import { getAlbums } from "./getAlbums";

export const albumRouter = createTRPCRouter({
	create,
	getAlbum,
	getAlbums,
	deleteAlbum,
});
