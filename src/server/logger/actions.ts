export const actions = [
	"UNKNOWN",

	"AUTHENTICATE",
	"CREATE_ACCOUNT",
	"CREATE_DEVICE",
	"DELETE_DEVICE",
	"GENERATE_CHALLENGE",
	"LIST_UNTRUSTED_DEVICES",
	"TRUST_DEVICE",
	"UPLOAD_IMAGE",
	"GET_USER_IMAGES",
	"GET_IMAGE_FILE",
	"CHANGE_DEVICE_KEY_PAIR",
	"LIST_TRUSTED_DEVICES",
	"CREATE_ALBUM",
	"DELETE_USER",
] as const;

export type Action = (typeof actions)[number];
