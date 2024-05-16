import { changeDevicePublicKey } from "@cryptalbum/server/api/routers/auth/changeDevicePublicKey";
import { createTRPCRouter } from "@cryptalbum/server/api/trpc";
import { createAccount } from "./createAccount";
import { createDevice } from "./createDevice";
import { deleteDevice } from "./deleteDevice";
import { generateChallenge } from "./generateChallenge";
import { listTrustedDevices } from "./listTrustedDevices";
import { listUntrustedDevices } from "./listUntrustedDevices";
import { trustDevice } from "./trustDevice";

export const authRouter = createTRPCRouter({
	createAccount,
	createDevice,
	challenge: generateChallenge,
	listUntrustedDevices,
	trustDevice,
	deleteDevice,
	changeDevicePublicKey,
	listTrustedDevices,
});
