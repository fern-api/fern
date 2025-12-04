import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const stringLiteral = <T extends string>(value: T) => getSchemaUtils(z.literal(value));
export const booleanLiteral = <T extends boolean>(value: T) => getSchemaUtils(z.literal(value));
