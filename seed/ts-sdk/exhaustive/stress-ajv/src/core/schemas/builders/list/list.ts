import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const list = <T extends z.ZodTypeAny>(itemSchema: T) => getSchemaUtils(z.array(itemSchema));
