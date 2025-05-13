import z from "zod";

export default z.object({
    id: z.unknown(),
    title: z.string(),
    rating: z.number(),
});
