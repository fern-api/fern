import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { ExportedFilePath } from "@fern-typescript/commons";
import { GeneratorCli } from "./Client";

const REFERENCE_FILENAME = "reference.md";

export class ReferenceGenerator {
    private generatorCli: GeneratorCli;
    private rootSection: FernGeneratorCli.RootPackageReferenceSection | undefined;
    private sections: FernGeneratorCli.ReferenceSection[] = [];

    constructor({ generatorCli }: { generatorCli: GeneratorCli }) {
        this.generatorCli = generatorCli;
    }

    public getExportedFilePath(): ExportedFilePath {
        return {
            directories: [],
            file: {
                nameOnDisk: REFERENCE_FILENAME
            },
            rootDir: ""
        };
    }

    public isEmpty(): boolean {
        return this.rootSection == null && this.sections.length === 0;
    }

    public async generateReference(): Promise<string> {
        const referenceConfig: FernGeneratorCli.ReferenceConfig = {
            rootSection: this.rootSection,
            sections: this.sections,
            language: FernGeneratorCli.Language.Typescript
        };
        return this.generatorCli.generateReference({ referenceConfig });
    }

    public addRootSection(): ReferenceSectionBuilder {
        const endpoints: FernGeneratorCli.EndpointReference[] = [];
        this.rootSection = {
            endpoints
        };
        return new ReferenceSectionBuilder({ endpoints });
    }

    public addSection({ title, description }: { title: string; description?: string }): ReferenceSectionBuilder {
        const endpoints: FernGeneratorCli.EndpointReference[] = [];
        const section: FernGeneratorCli.ReferenceSection = {
            title,
            description,
            endpoints
        };
        this.sections.push(section);
        return new ReferenceSectionBuilder({ endpoints });
    }
}

export class ReferenceSectionBuilder {
    private endpoints: FernGeneratorCli.EndpointReference[];

    constructor({ endpoints }: { endpoints: FernGeneratorCli.EndpointReference[] }) {
        this.endpoints = endpoints;
    }

    public addEndpoint(endpoint: FernGeneratorCli.EndpointReference): void {
        this.endpoints.push(endpoint);
    }
}
