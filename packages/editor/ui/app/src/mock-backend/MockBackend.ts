export interface LightweightAPI {
    packages: LightweightPackage[];
}

export interface LightweightPackage {
    packageId: PackageId;
    name: string;
    endpoints: LightweightEndpoint[];
    types: LightweightType[];
    errors: LightweightError[];
}

export type PackageId = string;
export type EndpointId = string;
export type TypeId = string;
export type ErrorId = string;

export interface LightweightEndpoint {
    endpointId: EndpointId;
    name: string;
}

export interface LightweightType {
    typeId: TypeId;
    name: string;
}

export interface LightweightError {
    errorId: ErrorId;
    name: string;
    statusCode: number;
}

export class MockBackend {
    private api: LightweightAPI = {
        packages: [
            {
                packageId: "312-31323-123-12313",
                name: "Encounters",
                endpoints: [
                    {
                        endpointId: "000-000",
                        name: "create",
                    },
                    {
                        endpointId: "000-001",
                        name: "get",
                    },
                    {
                        endpointId: "000-002",
                        name: "update",
                    },
                    {
                        endpointId: "000-003",
                        name: "delete",
                    },
                ],
                types: [
                    {
                        typeId: "im-a-type",
                        name: "BlogPost",
                    },
                    {
                        typeId: "im-a-type-2",
                        name: "BlogPostId",
                    },
                    {
                        typeId: "im-a-type-3",
                        name: "Author",
                    },
                ],
                errors: [
                    {
                        errorId: "im-an-error",
                        name: "PostNotFoundError",
                        statusCode: 404,
                    },
                ],
            },
        ],
    };

    public async getLightweightAPI(): Promise<LightweightAPI> {
        return this.withDelay(() => this.api);
    }

    public async setAPI(api: LightweightAPI): Promise<void> {
        await this.withDelay(() => {
            this.api = api;
        });
    }

    private withDelay<T>(run: () => T): Promise<T> {
        const delayMs = 400 + 600 * Math.random();
        return new Promise((resolve) => setTimeout(() => resolve(run()), delayMs));
    }
}
