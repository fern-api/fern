import z from "zod";

import * as schemas from "./";
export default z.object({
    id: schemas.MovieId,
    title: z.string(),
    rating: z.number(),
});
