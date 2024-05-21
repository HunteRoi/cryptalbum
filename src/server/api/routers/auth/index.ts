import { changeDevicePublicKey } from "@cryptalbum/server/api/routers/auth/changeDevicePublicKey";
import { checkActivity } from "@cryptalbum/server/api/routers/auth/checkActivity";
import { createTRPCRouter } from "@cryptalbum/server/api/trpc";
import { createAccount } from "./createAccount";
import { createDevice } from "./createDevice";
import { deleteDevice } from "./deleteDevice";
import { deleteUser } from "./deleteUser";
import { generateChallenge } from "./generateChallenge";
import { getSharedKeys } from "./getSharedKeys";
import { getUserDevices } from "./getUserDevices";
import { listTrustedDevices } from "./listTrustedDevices";
import { listUntrustedDevices } from "./listUntrustedDevices";
import { trustDevice } from "./trustDevice";
import { whoami } from "./whoami";

export const authRouter = createTRPCRouter({
	createAccount,
	createDevice,
	challenge: generateChallenge,
	listUntrustedDevices,
	trustDevice,
	deleteDevice,
	changeDevicePublicKey,
	listTrustedDevices,
	deleteUser,
	checkActivity,
	getUserDevices,
	whoami,
	getSharedKeys,
});
