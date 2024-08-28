import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { SdkContext } from "@fern-typescript/contexts";

export class ReferenceConfigBuilder {
    private rootSection: FernGeneratorCli.RootPackageReferenceSection | undefined;
    private sections: FernGeneratorCli.ReferenceSection[] = [];

    public build(_context: SdkContext): FernGeneratorCli.ReferenceConfig {
        return {
            rootSection: this.rootSection,
            sections: this.sections,
            language: FernGeneratorCli.Language.Typescript
        };
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

    public isEmpty(): boolean {
        return this.rootSection == null && this.sections.length === 0;
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
