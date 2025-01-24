import { HttpEndpointReferenceParser } from "@fern-api/fern-definition-schema";
import { HttpMethod } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";

import { ParseOpenAPIOptions } from "../../options";

export class OpenAPIFilter {
    public readonly endpoints: Set<string> | undefined;

    private readonly parser = new HttpEndpointReferenceParser();

    constructor({ context, options }: { context: TaskContext; options: ParseOpenAPIOptions }) {
        this.endpoints = options.filter?.endpoints
            ? new Set(this.validateAndFilterEndpoints({ context, endpoints: options.filter.endpoints }))
            : undefined;
    }

    public skipEndpoint({ method, path }: { method: HttpMethod; path: string }): boolean {
        return this.endpoints != null && !this.endpoints.has(`${method} ${path}`);
    }

    public hasEndpoints(): boolean {
        return this.endpoints != null;
    }

    private validateAndFilterEndpoints({
        context,
        endpoints
    }: {
        context: TaskContext;
        endpoints: string[];
    }): string[] {
        const result: string[] = [];
        for (const endpoint of endpoints) {
            const parsed = this.parser.tryParse(endpoint);
            if (parsed == null) {
                context.logger.debug(
                    `Ignoring configured filter endpoint "${endpoint}"; expected format "POST /users/get"`
                );
                continue;
            }
            result.push(`${parsed.method} ${parsed.path}`);
        }
        return result;
    }
}
