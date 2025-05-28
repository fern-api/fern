import z from "zod";

import * as schemas from "./";
export default z.object({
    title: z.string(),
    rating: z.number(),
});
