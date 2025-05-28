import z from "zod";

export default z.object({
    title: z.string(),
    rating: z.number(),
});
