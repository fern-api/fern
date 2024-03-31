import { LocalBuildInfo } from "../../config/api";

export interface GeneratorRunner {
    /**
     * Builds the generator.
     */
    build(): Promise<void>;

    /**
     * Runs the generator.
     */
    run(): Promise<void>;
}

export class LocalGeneratorRunner implements GeneratorRunner {
    constructor(private readonly generator: LocalBuildInfo) {}

    async build(): Promise<void> {}

    async run(): Promise<void> {}
}

export class DockerGeneratorRunner implements GeneratorRunner {
    constructor(private readonly generator: string) {}

    async build(): Promise<void> {}

    async run(): Promise<void> {}
}
