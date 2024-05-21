export const renderableActions = [
	"AUTHENTICATE",
	"DELETE_DEVICE",
	"TRUST_DEVICE",
	"UPLOAD_IMAGE",
	"UPDATE_IMAGE",
	"DELETE_IMAGE",
	"CHANGE_DEVICE_KEY_PAIR",
	"CREATE_ALBUM",
	"UPDATE_ALBUM",
	"DELETE_ALBUM",
	"SHARE_ALBUM",
];

const nonRenderableActions = [
	"UNKNOWN",
	"LIST_UNTRUSTED_DEVICES",
	"CREATE_ACCOUNT",
	"CREATE_DEVICE",
	"GENERATE_CHALLENGE",
	"GET_USER_IMAGES",
	"GET_SHARED_KEYS",
	"GET_IMAGE_FILE",
	"LIST_TRUSTED_DEVICES",
	"GET_USER_ALBUMS",
	"GET_ALBUM_IMAGES",
	"DELETE_USER",
	"DELETE_ALBUM",
] as const;

export const actions = [...nonRenderableActions, ...renderableActions] as const;

export type Action = (typeof actions)[number];
