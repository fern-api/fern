import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const any = () => getSchemaUtils(z.any());
