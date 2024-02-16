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

interface ReferenceParameterDeclaration {
    name: string;
    type: string;
    link?: string;
    description?: string;
}
interface EndpointDeclaration {
    functionName: string;
    returnType: string;
    codeSnippet: string;
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

    write(): string {
        // TODO: Implement this correctly
        return this.endpoints
            .map((endpoint) => {
                return `
## ${this.heading}

<details><summary> <code>carbon.<a href="src/Client.ts">search</a>({ ...params }) -> DocumentResponseList</code> </summary>

<dl>
<dd>

#### Usage
\`\`\`ts

\`\`\`

#### Parameters



</dd>
</dl>

</details>

---

`;
            })
            .join("\n");
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
        return new ReferenceGeneratorSection({ clientName: this.clientName, heading });
    }

    public write(): string {
        return `
# ${this.apiName ?? "SDK"} Reference

---

${this.sections.map((section) => section.write()).join("\n")}
`;
    }
}
