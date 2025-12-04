import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const undiscriminatedUnion = <T extends z.ZodTypeAny[]>(schemas: T) =>
    getSchemaUtils(z.union(schemas as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]));
