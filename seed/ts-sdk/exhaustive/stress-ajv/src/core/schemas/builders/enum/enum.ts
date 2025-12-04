import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const enum_ = <T extends string>(values: T[]) => getSchemaUtils(z.enum(values as [T, ...T[]]));
