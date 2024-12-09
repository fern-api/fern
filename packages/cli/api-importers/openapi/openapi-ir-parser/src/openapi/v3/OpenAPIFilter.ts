import { ParseOpenAPIOptions } from "../../options";

export class OpenAPIFilter {
    public readonly paths: Set<string> | undefined;

    constructor(options: ParseOpenAPIOptions) {
        this.paths = options.filter?.paths ? new Set(options.filter.paths) : undefined;
    }

    public skipPath(path: string): boolean {
        return this.paths != null && !this.paths.has(path);
    }

    public hasPaths(): boolean {
        return this.paths != null;
    }
}
