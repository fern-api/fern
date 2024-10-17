import { z } from "zod";
import { TaskContext } from "@fern-api/task-context";
import { parse } from "@fern-api/openapi-ir-parser";
import { FernOpenAPIExtension } from "@fern-api/openapi-ir-parser";
import { getAllOpenAPISpecs, OpenAPISpec, OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { readFile } from "fs/promises";

export async function transformSpecToSchema({
    workspace,
    context
}: {
    workspace: OSSWorkspace;
    context: TaskContext;
}): Promise<{ openApiSpec: OpenAPISpec; stringifiedSpec: string; schema: z.ZodTypeAny }[]> {
    // This is for sure overkill, but alas we are HACKIN'
    const specSchemasForWorkspace: { openApiSpec: OpenAPISpec; stringifiedSpec: string; schema: z.ZodTypeAny }[] = [];
    const specs = await getAllOpenAPISpecs({ context, specs: workspace.specs });
    for (const spec of specs) {
        const ir = await parse({
            absoluteFilePathToWorkspace: workspace.absoluteFilePath,
            specs: [spec],
            taskContext: context
        });

        const schemaObject: Record<string, z.ZodTypeAny> = {};
        for (const endpoint of ir.endpoints) {
            if (!(endpoint.path in schemaObject)) {
                // This is weirdly verbose, but when moved into variables, zod would use references and refer between endpoints in a weird way
                schemaObject[endpoint.path] = z.object({
                    get: z.optional(
                        z.object({
                            [FernOpenAPIExtension.SDK_METHOD_NAME]: z.optional(z.string()),
                            [FernOpenAPIExtension.SDK_GROUP_NAME]: z.optional(z.array(z.string()))
                        })
                    ),
                    post: z.optional(
                        z.object({
                            [FernOpenAPIExtension.SDK_METHOD_NAME]: z.optional(z.string()),
                            [FernOpenAPIExtension.SDK_GROUP_NAME]: z.optional(z.array(z.string()))
                        })
                    ),
                    put: z.optional(
                        z.object({
                            [FernOpenAPIExtension.SDK_METHOD_NAME]: z.optional(z.string()),
                            [FernOpenAPIExtension.SDK_GROUP_NAME]: z.optional(z.array(z.string()))
                        })
                    ),
                    delete: z.optional(
                        z.object({
                            [FernOpenAPIExtension.SDK_METHOD_NAME]: z.optional(z.string()),
                            [FernOpenAPIExtension.SDK_GROUP_NAME]: z.optional(z.array(z.string()))
                        })
                    ),
                    patch: z.optional(
                        z.object({
                            [FernOpenAPIExtension.SDK_METHOD_NAME]: z.optional(z.string()),
                            [FernOpenAPIExtension.SDK_GROUP_NAME]: z.optional(z.array(z.string()))
                        })
                    )
                });
            }
        }
        specSchemasForWorkspace.push({
            openApiSpec: spec,
            stringifiedSpec: (await readFile(spec.absoluteFilepath, "utf8")).toString(),
            schema: z.object({
                paths: z.object(schemaObject)
            })
        });
    }

    return specSchemasForWorkspace;
}
