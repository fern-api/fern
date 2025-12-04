import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const record = <K extends z.ZodTypeAny, V extends z.ZodTypeAny>(keySchema: K, valueSchema: V) =>
    getSchemaUtils(z.record(keySchema, valueSchema));
