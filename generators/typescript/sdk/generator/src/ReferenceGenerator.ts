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
    typePath?: string;
    description?: string;
}
export interface EndpointDeclaration {
    functionPath?: string;
    functionName: string;
    returnType: string | undefined;
    returnTypePath?: string;
    codeSnippet: string | undefined;
    parameters: ReferenceParameterDeclaration[];
    description?: string;
}

function writeIndentedBlock(content: string): string {
    return `<dl>\n\n<dd>\n\n${content}\n\n</dd>\n\n</dl>`;
}

function wrapInLink(content: string, link?: string) {
    return link !== undefined ? `<a href="./src${link}">${content}</a>` : content;
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
**${parameter.name}: \`${wrapInLink(parameter.type, parameter.typePath)}\`** ${
            parameter.description !== undefined ? "— " + parameter.description : ""
        }
`;
    }

    private writeEndpoint(endpoint: EndpointDeclaration): string {
        const descriptionBlock =
            endpoint.description !== undefined ? `<br/>\n\n${writeIndentedBlock("> " + endpoint.description)}\n\n` : "";
        const usageBlock =
            endpoint.codeSnippet !== undefined
                ? `#### 🔌 Usage\n\n${writeIndentedBlock(
                      writeIndentedBlock("```ts\n" + endpoint.codeSnippet + "```")
                  )}\n\n`
                : "";
        const parametersBlock =
            endpoint.parameters.length > 0
                ? `#### ⚙️ Parameters\n\n${writeIndentedBlock(
                      endpoint.parameters
                          .map((parameter) => writeIndentedBlock(this.writeParameter(parameter)))
                          .join("\n\n")
                  )}\n\n`
                : "";

        return `
<details><summary> <code>${this.clientName}.${wrapInLink(
            endpoint.functionName,
            endpoint.functionPath
        )}({ ...params }) -> ${wrapInLink(
            endpoint.returnType === undefined ? "void" : endpoint.returnType,
            endpoint.returnTypePath
        )}</code> </summary>

${writeIndentedBlock(descriptionBlock + usageBlock + parametersBlock)}
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
