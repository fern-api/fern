import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernDefinitionBuilderImpl } from "../FernDefnitionBuilder";

describe("Fern Definition Builder", () => {
    it("removes base path from environment", async () => {
        const builder = new FernDefinitionBuilderImpl(
            {
                apiVersion: undefined,
                title: undefined,
                description: undefined,
                basePath: undefined,
                servers: [],
                tags: {
                    tagsById: {},
                    orderedTagIds: []
                },
                hasEndpointsMarkedInternal: false,
                endpoints: [],
                webhooks: [],
                schemas: {},
                variables: {},
                nonRequestReferencedSchemas: new Set(),
                securitySchemes: {},
                globalHeaders: [],
                idempotencyHeaders: [],
                groups: {},
                channel: []
            },
            true,
            false
        );
        builder.addEnvironment({
            name: "Production",
            schema: "https://buildwithfern.com/api/v1"
        });
        builder.addEnvironment({
            name: "Staging",
            schema: {
                url: "https://staging.buildwithfern.com/api/v1"
            }
        });
        const usersYml = RelativeFilePath.of("users.yml");
        builder.addEndpoint(usersYml, {
            name: "get",
            schema: {
                method: "GET",
                path: "/users"
            }
        });
        const definition = builder.build();
        expect(definition.rootApiFile.environments != null).toEqual(true);
        const stringifiedEnvironments = JSON.stringify(definition.rootApiFile.environments ?? {});
        expect(stringifiedEnvironments).toContain("https://buildwithfern.com");
        expect(stringifiedEnvironments).toContain("https://staging.buildwithfern.com");
        expect(stringifiedEnvironments).not.toContain("https://buildwithfern.com/api/v1");
        expect(stringifiedEnvironments).not.toContain("https://staging.buildwithfern.com/api/v1");

        // eslint-disable-next-line @typescript-eslint/dot-notation
        expect(definition.definitionFiles[usersYml]?.service?.endpoints["get"]?.path).toBe("/api/v1/users");
    });
});
