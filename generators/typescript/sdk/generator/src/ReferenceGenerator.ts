export declare namespace ReferenceGenerator {
    export interface Init {
        clientName: string;
        apiName?: string;
    }
}
export declare namespace ReferenceGeneratorSection {
    export interface Init {
        clientName: string;
        // Heading is essentially just the endpoint name in the root package OR
        heading: string;
    }
}

export interface ReferenceParameterDeclaration {
    name: string;
    type: string;
    link?: string;
    description?: string;
}
export interface EndpointDeclaration {
    functionFileName: string;
    functionName: string;
    returnType: string | undefined;
    codeSnippet: string | undefined;
    parameters: ReferenceParameterDeclaration[];
}

class ReferenceGeneratorSection {
    clientName: string;
    heading: string;
    endpoints: EndpointDeclaration[];

    constructor(init: ReferenceGeneratorSection.Init) {
        this.clientName = init.clientName;
        this.heading = init.heading;
        this.endpoints = [];
    }

    public addEndpoint(endpoint: EndpointDeclaration): void {
        this.endpoints.push(endpoint);
    }

    private writeParameter(parameter: ReferenceParameterDeclaration): string {
        return `
##### ${parameter.name}: \`${parameter.type}\`

${parameter.description ?? ""}

`;
    }

    private writeEndpoint(endpoint: EndpointDeclaration): string {
        return `
<details><summary> <code>${this.clientName}.${endpoint.functionName}({ ...params }) -> ${
            endpoint.returnType === undefined ? "void" : endpoint.returnType
        }</code> </summary>

<dl>
<dd>

${
    endpoint.codeSnippet !== undefined
        ? "#### 🔌 Usage\n\n<dl>\n\n<dd>\n\n```ts\n" + endpoint.codeSnippet + "```\n\n</dl>\n\n</dd>\n\n"
        : ""
}

${
    endpoint.parameters.length > 0
        ? "#### ⚙️ Parameters\n\n" + endpoint.parameters.map((parameter) => this.writeParameter(parameter)).join("\n")
        : ""
}

</dd>
</dl>

</details>
`;
    }

    write(): string {
        return `
## ${this.heading}

${this.endpoints.map((endpoint) => this.writeEndpoint(endpoint)).join("\n")}

`;
    }
}

export class ReferenceGenerator {
    apiName: string | undefined;
    clientName: string;
    sections: ReferenceGeneratorSection[];

    constructor(init: ReferenceGenerator.Init) {
        this.clientName = init.clientName;
        this.apiName = init.apiName;
        this.sections = [];
    }

    public addSection(heading: string): ReferenceGeneratorSection {
        const section = new ReferenceGeneratorSection({ clientName: this.clientName, heading });
        this.sections.push(section);
        return section;
    }

    public write(): string {
        return this.sections
            .filter((section) => section.heading.length > 0)
            .map((section) => section.write())
            .join("\n");
    }
}
