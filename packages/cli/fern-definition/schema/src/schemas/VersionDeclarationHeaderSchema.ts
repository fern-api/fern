import { z } from "zod";
import { VersionDeclarationHeaderObjectSchema } from "./VersionDeclarationHeaderObjectSchema";

export const VersionDeclarationHeaderSchema = z.union([z.string(), VersionDeclarationHeaderObjectSchema]);

export type VersionDeclarationHeaderSchema = z.infer<typeof VersionDeclarationHeaderSchema>;
