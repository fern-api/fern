import type fs from "fs";

import type { FernGeneratorCli } from "../configuration/sdk";
import type {
    EndpointReference,
    LinkedText,
    ParameterReference,
    ReferenceSection,
    RelativeLocation,
    RootPackageReferenceSection
} from "../configuration/sdk/api";
import { StreamWriter, StringWriter, type Writer } from "../utils/Writer";

export class ReferenceGenerator {
    private referenceConfig: FernGeneratorCli.ReferenceConfig;

    constructor({
        referenceConfig
    }: {
        referenceConfig: FernGeneratorCli.ReferenceConfig;
    }) {
        this.referenceConfig = referenceConfig;
    }

    public async generate({ output }: { output: fs.WriteStream | NodeJS.Process["stdout"] }): Promise<void> {
        const writer = new StreamWriter(output);
        await writer.writeLine("# Reference");

        if (this.referenceConfig.rootSection != null) {
            await this.writeRootSection({
                section: this.referenceConfig.rootSection,
                writer
            });
        }
        for (const section of this.referenceConfig.sections) {
            await this.writeSection({ section, writer });
        }
        await writer.end();
    }

    private async writeRootSection({
        section,
        writer
    }: {
        section: RootPackageReferenceSection;
        writer: Writer;
    }): Promise<void> {
        if (section.description != null) {
            await writer.writeLine(section.description);
        }
        for (const endpoint of section.endpoints) {
            await this.writeEndpoint({ endpoint, writer });
        }
    }

    private async writeSection({ section, writer }: { section: ReferenceSection; writer: Writer }): Promise<void> {
        await writer.writeLine(`## ${section.title}`);
        if (section.description != null) {
            await writer.writeLine(section.description);
        }
        for (const endpoint of section.endpoints) {
            await this.writeEndpoint({ endpoint, writer });
        }
    }

    private async writeEndpoint({ endpoint, writer }: { endpoint: EndpointReference; writer: Writer }): Promise<void> {
        const stringWriter = new StringWriter();
        if (endpoint.description != null) {
            await stringWriter.writeLine(
                `#### 📝 Description\n\n${this.generateIndentedBlock(this.generateIndentedBlock(endpoint.description))}\n`
            );
        }
        await stringWriter.writeLine(
            `#### 🔌 Usage\n\n${this.generateIndentedBlock(
                this.generateIndentedBlock(
                    `\`\`\`${this.referenceConfig.language.toLowerCase()}\n${endpoint.snippet}\n\`\`\``
                )
            )}\n`
        );
        if (endpoint.parameters.length > 0) {
            await stringWriter.writeLine(
                `#### ⚙️ Parameters\n\n${this.generateIndentedBlock(
                    endpoint.parameters
                        .map((parameter) => this.generateIndentedBlock(this.generateParameter(parameter)))
                        .join("\n\n")
                )}\n`
            );
        }

        let linkedSnippet = this.wrapInLinksAndJoin(endpoint.title.snippetParts);
        if (endpoint.title.returnValue != null) {
            linkedSnippet += ` -> ${this.wrapInLink(endpoint.title.returnValue.text, endpoint.title.returnValue.location)}`;
        }
        await writer.writeLine(`<details><summary><code>${linkedSnippet}</code></summary>`);
        await writer.writeLine(this.generateIndentedBlock(stringWriter.toString()));
        await writer.writeLine("</details>\n");
    }

    private generateParameter(parameter: ParameterReference): string {
        const desc = parameter.description?.match(/[^\r\n]+/g)?.length;
        const containsLineBreak = desc != null && desc > 1;
        return `**${parameter.name}:** \`${this.wrapInLink(parameter.type, parameter.location)}\` ${
            parameter.description != null ? (containsLineBreak ? "\n\n" : "— ") + parameter.description : ""
        }
    `;
    }

    private generateIndentedBlock(content: string): string {
        return `<dl>\n<dd>\n\n${content}\n</dd>\n</dl>`;
    }

    private wrapInLinksAndJoin(content: LinkedText[]): string {
        return content.map(({ text, location }) => this.wrapInLink(text, location)).join("");
    }

    private wrapInLink(content: string, link?: RelativeLocation) {
        return link != null ? `<a href="${link.path}">${content}</a>` : content;
    }
}
