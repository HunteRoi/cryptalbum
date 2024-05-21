import type { Extended, NonEmptyArray } from "@cryptalbum/@types";
import { createTRPCRouter } from "../../trpc";
import { create } from "./create";
import { deleteAlbum } from "./deleteAlbum";
import { getAlbum } from "./getAlbum";
import { getAlbums } from "./getAlbums";
import { shareAlbum } from "./shareAlbum";
import { updateAlbum } from "./updateAlbum";

export type SharedKey = {
	key: string;
};
export type Album = {
	id: string;
	name: string;
	description: string | null;
	shareds: SharedKey[];
	userId: string;
};
export type AlbumWithAtLeastOneSharedKey = Extended<
	Album,
	"shareds",
	NonEmptyArray<SharedKey>
>;

export const albumRouter = createTRPCRouter({
	create,
	getAlbum,
	getAlbums,
	deleteAlbum,
	updateAlbum,
	shareAlbum,
});
