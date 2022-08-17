import { FilePath } from "@fern-api/core-utils";
import { z } from "zod";
import { GeneratorInvocationSchema } from "./GeneratorInvocationSchema";

export const WorkspaceConfigurationSchema = z.strictObject({
    name: z.string(),
    definition: z.string().transform(FilePath.of),
    generators: z.array(GeneratorInvocationSchema),
});

export type WorkspaceConfigurationSchema = z.infer<typeof WorkspaceConfigurationSchema>;
