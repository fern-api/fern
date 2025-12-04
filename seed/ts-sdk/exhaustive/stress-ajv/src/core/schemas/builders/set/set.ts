import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const set = <T extends z.ZodTypeAny>(itemSchema: T) =>
    getSchemaUtils(z.array(itemSchema).transform((arr) => new Set(arr)));
