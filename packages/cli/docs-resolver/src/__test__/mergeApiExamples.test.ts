import type { FdrAPI } from "@fern-api/fdr-sdk";

import { mergeApiExamples } from "../utils/mergeApiExamples";

describe("mergeApiExamples", () => {
    it("merges code examples from Fern API into OpenAPI examples", () => {
        const fernApi: FdrAPI.api.v1.read.ApiDefinition = {
            id: "test" as any,
            types: {},
            auth: undefined,
            hasMultipleBaseUrls: false,
            navigation: undefined,
            globalHeaders: [],
            rootPackage: {
                websockets: [],
                webhooks: [],
                types: [],
                subpackages: [],
                pointsTo: undefined,
                endpoints: [
                    {
                        authed: false,
                        defaultEnvironment: undefined,
                        environments: [],
                        id: "listUsers" as any,
                        method: "GET",
                        path: { parts: [], pathParameters: [] },
                        originalEndpointId: "listUsers" as any,
                        urlSlug: "users",
                        migratedFromUrlSlugs: [],
                        name: "List users",
                        queryParameters: [],
                        headers: [],
                        request: undefined,
                        response: undefined,
                        errors: [],
                        errorsV2: [],
                        snippetTemplates: undefined,
                        description: undefined,
                        availability: undefined,
                        examples: [
                            {
                                name: "List users",
                                pathParameters: {},
                                queryParameters: {},
                                headers: {},
                                requestBody: undefined,
                                requestBodyV3: undefined,
                                responseStatusCode: 200,
                                responseBody: undefined,
                                responseBodyV3: undefined,
                                path: "",
                                description: undefined,
                                codeSamples: [],
                                codeExamples: {
                                    typescriptSdk: {
                                        client: "client.users.list()",
                                        install: "npm install @fern/api"
                                    },
                                    pythonSdk: {
                                        sync_client: "client.users.list()",
                                        async_client: "await client.users.list()",
                                        install: "pip install fern-api"
                                    },
                                    nodeAxios: undefined,
                                    rubySdk: undefined,
                                    goSdk: undefined
                                }
                            }
                        ]
                    }
                ]
            },
            subpackages: {}
        };

        const endpointId = "listUsers" as any;
        const api: FdrAPI.api.latest.ApiDefinition = {
            id: "test" as any,
            endpoints: {
                [endpointId]: {
                    id: endpointId,
                    method: "GET",
                    path: [],
                    examples: [
                        {
                            name: "List users",
                            path: "",
                            pathParameters: {},
                            queryParameters: {},
                            headers: {},
                            requestBody: undefined,
                            responseStatusCode: 200,
                            responseBody: undefined,
                            description: undefined,
                            snippets: {
                                node: [
                                    {
                                        name: "List users",
                                        language: "node",
                                        code: "axios.get('/users')",
                                        generated: true,
                                        install: undefined,
                                        description: undefined
                                    }
                                ]
                            }
                        }
                    ],
                    environments: [],
                    requests: [],
                    responses: [],
                    errors: [],
                    displayName: "List users",
                    operationId: "listUsers",
                    auth: undefined,
                    defaultEnvironment: undefined,
                    pathParameters: [],
                    queryParameters: [],
                    requestHeaders: [],
                    requestBody: undefined,
                    responseHeaders: [],
                    responseStatusCode: 200,
                    responseBody: undefined,
                    snippetTemplates: undefined,
                    description: undefined,
                    availability: undefined,
                    namespace: undefined
                } as FdrAPI.api.latest.EndpointDefinition
            },
            websockets: {},
            webhooks: {},
            types: {},
            subpackages: {},
            auths: {},
            globalHeaders: []
        };

        mergeApiExamples(fernApi, api);

        expect(api.endpoints[endpointId]?.examples?.[0]?.snippets).toEqual({
            node: [
                {
                    name: "List users",
                    language: "node",
                    code: "axios.get('/users')",
                    generated: true,
                    install: undefined,
                    description: undefined
                }
            ],
            typescript: [
                {
                    name: "List users",
                    language: "typescript",
                    code: "client.users.list()",
                    generated: true,
                    install: "npm install @fern/api",
                    description: undefined
                }
            ],
            python: [
                {
                    name: "List users",
                    language: "python",
                    code: "await client.users.list()",
                    generated: true,
                    install: "pip install fern-api",
                    description: undefined
                },
                {
                    name: "List users",
                    language: "python",
                    code: "client.users.list()",
                    generated: true,
                    install: "pip install fern-api",
                    description: undefined
                }
            ]
        });
    });
});
