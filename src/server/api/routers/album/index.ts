import { createTRPCRouter } from "../../trpc";
import { create } from "./create";

export const albumRouter = createTRPCRouter({
    create,
});
