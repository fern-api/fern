import { docsYml } from "@fern-api/configuration";
import type { z } from "zod";

export const DocsSchema = docsYml.DocsYmlSchemas.DocsConfiguration;
export type DocsSchema = z.infer<typeof DocsSchema>;
