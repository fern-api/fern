import z from "zod";

export default z.object({
    id: z.any(),
    title: z.string(),
    rating: z.number(),
});
