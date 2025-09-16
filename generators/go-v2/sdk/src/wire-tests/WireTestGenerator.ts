import { File, Style } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { go } from "@fern-api/go-ast";
import { DynamicSnippetsGenerator } from "@fern-api/go-dynamic-snippets";
import { dynamic, HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest";
import { convertIr } from "../utils/convertIr";

export class WireTestGenerator {
    private dynamicIr: dynamic.DynamicIntermediateRepresentation;
    private dynamicSnippetsGenerator: DynamicSnippetsGenerator;

    constructor(private readonly context: SdkGeneratorContext) {
        this.context = context;
        const dynamicIr = this.context.ir.dynamic;
        if (!dynamicIr) {
            throw new Error("Cannot generate wire tests without dynamic IR");
        }
        this.dynamicIr = dynamicIr;
        this.dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            ir: convertIr(dynamicIr),
            config: this.context.config
        });
    }

    public async generate(): Promise<void> {
        await this.context.project.writeSharedTestFiles();

        const endpointsByService = this.groupEndpointsByService();

        for (const [serviceName, endpoints] of endpointsByService.entries()) {
            const endpointsWithExamples = endpoints.filter((endpoint) => {
                const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
                return dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0;
            });

            if (endpointsWithExamples.length === 0) {
                continue;
            }

            const serviceTestFile = await this.generateServiceTestFile(serviceName, endpointsWithExamples);

            this.context.project.addRawFiles(serviceTestFile);
        }
    }

    private async generateServiceTestFile(serviceName: string, endpoints: HttpEndpoint[]): Promise<File> {
        const endpointTestCases = new Map<string, string>();
        for (const endpoint of endpoints) {
            const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
            if (dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0) {
                const firstExample = dynamicEndpoint.examples[0];
                if (firstExample) {
                    try {
                        const snippet = await this.generateSnippetForExample(firstExample);
                        endpointTestCases.set(endpoint.id, snippet);
                    } catch (error) {
                        this.context.logger.warn(`Failed to generate snippet for endpoint ${endpoint.id}: ${error}`);
                        // Skip this endpoint if snippet generation fails
                        continue;
                    }
                }
            }
        }

        const imports = new Map<string, string>();
        const endpointTestCaseCodeBlocks = endpoints
            .map((endpoint) => {
                const snippet = endpointTestCases.get(endpoint.id);
                if (!snippet) {
                    this.context.logger.warn(`No snippet found for endpoint ${endpoint.id}`);
                    return null;
                }
                const [endpointTestCaseCodeBlock, endpointImports] = this.parseEndpointTestCaseSnippet(snippet);
                for (const [importName, importPath] of endpointImports.entries()) {
                    imports.set(importName, importPath);
                }

                return endpointTestCaseCodeBlock;
            })
            .filter((endpointTestCaseCodeBlock) => endpointTestCaseCodeBlock !== null);

        const serviceTestFileContent = go
            .codeblock((writer) => {
                this.writeImports(writer, imports);
                writer.writeNewLineIfLastLineNot();
                writer.writeLine();
                for (const endpointTestCaseCodeBlock of endpointTestCaseCodeBlocks) {
                    writer.write(endpointTestCaseCodeBlock);
                    writer.writeNewLineIfLastLineNot();
                    writer.writeLine();
                }
            })
            .toString({
                packageName: "wiremock",
                rootImportPath: this.context.getRootPackageName(),
                importPath: this.context.getRootPackageName(),
                customConfig: this.context.customConfig ?? {},
                formatter: undefined
            });

        return new File(serviceName + "_test.go", RelativeFilePath.of("./test"), serviceTestFileContent);
    }

    private async generateSnippetForExample(example: dynamic.EndpointExample): Promise<string> {
        const snippetRequest = convertDynamicEndpointSnippetRequest(example);
        const response = await this.dynamicSnippetsGenerator.generate(snippetRequest, {
            config: { outputWiremockTests: true }
        });
        if (!response.snippet) {
            throw new Error("No snippet generated for example");
        }
        return response.snippet;
    }

    private parseEndpointTestCaseSnippet(fileString: string): [string, Map<string, string>] {
        const imports = new Map<string, string>();
        const lines = fileString.split("\n");

        let inImportBlock = false;
        let testMethodStart = -1;
        let braceCount = 0;
        let testMethodEnd = -1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]?.trim() ?? "";

            // Parse import statements
            if (line === "import (") {
                inImportBlock = true;
                continue;
            }

            if (inImportBlock) {
                if (line === ")") {
                    inImportBlock = false;
                    continue;
                }

                // Parse import with alias: alias "path"
                const importMatch = line.match(/^(\w+)\s+"([^"]+)"/);
                if (importMatch && importMatch[1] && importMatch[2]) {
                    const [, alias, path] = importMatch;
                    imports.set(alias, path);
                }
            }

            // Find test method start
            if (line.startsWith("func") && testMethodStart === -1) {
                testMethodStart = i;
            }

            // Count braces to find test method end
            if (testMethodStart !== -1 && testMethodEnd === -1) {
                for (const char of line) {
                    if (char === "{") {
                        braceCount++;
                    } else if (char === "}") {
                        braceCount--;
                        if (braceCount === 0) {
                            testMethodEnd = i;
                            break;
                        }
                    }
                }
            }
        }

        // Extract test method content
        let testMethodContent = "";
        if (testMethodStart !== -1 && testMethodEnd !== -1) {
            testMethodContent = lines.slice(testMethodStart, testMethodEnd + 1).join("\n") + "\n";
        }

        return [testMethodContent, imports];
    }

    private writeImports(writer: any, imports: Map<string, string>): void {
        const standardLibraryImports: string[] = [];
        const externalImports: Array<[string, string]> = [];

        for (const [alias, importPath] of imports.entries()) {
            if (this.isStandardLibraryImport(importPath)) {
                standardLibraryImports.push(importPath);
            } else {
                externalImports.push([alias, importPath]);
            }
        }

        standardLibraryImports.sort();
        externalImports.sort(([, pathA], [, pathB]) => pathA.localeCompare(pathB));

        writer.writeLine("import (");
        for (const importPath of standardLibraryImports) {
            writer.writeLine(`\t"${importPath}"`);
        }
        if (standardLibraryImports.length > 0 && externalImports.length > 0) {
            writer.writeLine();
        }
        for (const [alias, importPath] of externalImports) {
            writer.writeLine(`\t${alias} "${importPath}"`);
        }

        writer.writeLine(")");
    }

    private isStandardLibraryImport(importPath: string): boolean {
        const standardLibraryPackages = [
            "context",
            "fmt",
            "io",
            "net",
            "net/http",
            "os",
            "strings",
            "testing",
            "time",
            "encoding/json",
            "encoding/base64",
            "crypto/md5",
            "crypto/sha1",
            "crypto/sha256",
            "crypto/sha512",
            "hash",
            "math",
            "math/rand",
            "sort",
            "strconv",
            "sync",
            "unicode",
            "unicode/utf8",
            "unsafe",
            "reflect",
            "runtime",
            "path",
            "path/filepath",
            "regexp",
            "bytes",
            "bufio",
            "compress/gzip",
            "compress/flate",
            "archive/tar",
            "archive/zip",
            "database/sql",
            "database/sql/driver",
            "html",
            "html/template",
            "image",
            "image/color",
            "image/draw",
            "image/gif",
            "image/jpeg",
            "image/png",
            "log",
            "log/syslog",
            "mime",
            "mime/multipart",
            "net/mail",
            "net/smtp",
            "net/textproto",
            "net/url",
            "net/rpc",
            "net/rpc/jsonrpc",
            "plugin",
            "text",
            "text/scanner",
            "text/tabwriter",
            "text/template",
            "text/template/parse",
            "vendor"
        ];

        const path = importPath.replace(/"/g, "");
        return !path.includes(".") || standardLibraryPackages.includes(path);
    }

    private groupEndpointsByService(): Map<string, HttpEndpoint[]> {
        const endpointsByService = new Map<string, HttpEndpoint[]>();

        for (const service of Object.values(this.context.ir.services)) {
            const serviceName =
                service.name?.fernFilepath?.allParts?.map((part) => part.snakeCase.safeName).join("_") || "root";

            endpointsByService.set(serviceName, service.endpoints);
        }

        return endpointsByService;
    }
}
