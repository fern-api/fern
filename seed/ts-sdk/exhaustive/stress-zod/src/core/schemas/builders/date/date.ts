import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const date = () => getSchemaUtils(z.string().transform((s) => new Date(s)));
