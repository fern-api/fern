import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const lazy = <T extends z.ZodTypeAny>(getter: () => T) => getSchemaUtils(z.lazy(getter));
export const lazyObject = lazy;
