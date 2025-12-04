import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const discriminant = <_T extends string>(rawKey: string, parsedKey: string) => ({ rawKey, parsedKey });
export const union = <T extends z.ZodTypeAny[]>(discriminator: string, schemas: T) =>
    getSchemaUtils(z.discriminatedUnion(discriminator, schemas as any));
