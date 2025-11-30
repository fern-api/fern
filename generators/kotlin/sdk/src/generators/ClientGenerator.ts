import { RelativeFilePath } from "@fern-api/fs-utils";
import { KotlinFile as AstKotlinFile, Class, Property, Type, Function, Parameter } from "@fern-api/kotlin-ast";
import { KotlinFile } from "@fern-api/kotlin-base";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class ClientGenerator {
    constructor(private readonly context: SdkGeneratorContext) {}

    public async generate(): Promise<void> {
        this.context.logger.info("Generating client...");

        const packageName = this.context.getPackageName();
        const clientName = this.context.getClientName();

        const clientFile = this.generateClientClass(clientName, packageName);
        this.context.project.addFile(clientFile);

        for (const [serviceId, service] of Object.entries(this.context.ir.services.http)) {
            const serviceFile = this.generateServiceClient(service, packageName);
            this.context.project.addFile(serviceFile);
        }
    }

    private generateClientClass(clientName: string, packageName: string): KotlinFile {
        const clientClass = new Class({
            name: clientName,
            constructorParameters: [
                new Parameter({
                    name: "baseUrl",
                    type: Type.string()
                }),
                new Parameter({
                    name: "apiKey",
                    type: Type.string(true),
                    defaultValue: "null"
                })
            ],
            properties: [
                new Property({
                    name: "httpClient",
                    type: new Type({ name: "HttpClient" }),
                    initializer: "HttpClient()",
                    modifiers: ["private"]
                })
            ],
            docs: `Main client for the ${this.context.ir.apiName.pascalCase.safeName} API`
        });

        const kotlinFile = new AstKotlinFile({
            packageName,
            classes: [clientClass]
        });

        const filePath = RelativeFilePath.of(`src/main/kotlin/${packageName.replace(/\./g, "/")}/${clientName}.kt`);
        return new KotlinFile(filePath, kotlinFile);
    }

    private generateServiceClient(service: any, packageName: string): KotlinFile {
        const serviceName = service.name.pascalCase.safeName + "Service";

        const serviceClass = new Class({
            name: serviceName,
            constructorParameters: [
                new Parameter({
                    name: "client",
                    type: new Type({ name: this.context.getClientName() }),
                    modifiers: ["private"]
                })
            ],
            functions: service.endpoints.map((endpoint: any) => this.generateEndpointFunction(endpoint)),
            docs: service.docs ?? undefined
        });

        const kotlinFile = new AstKotlinFile({
            packageName,
            classes: [serviceClass]
        });

        const filePath = RelativeFilePath.of(`src/main/kotlin/${packageName.replace(/\./g, "/")}/${serviceName}.kt`);
        return new KotlinFile(filePath, kotlinFile);
    }

    private generateEndpointFunction(endpoint: any): Function {
        const functionName = endpoint.name.camelCase.safeName;
        const parameters: Parameter[] = [];

        endpoint.allPathParameters?.forEach((param: any) => {
            parameters.push(
                new Parameter({
                    name: param.name.camelCase.safeName,
                    type: Type.string()
                })
            );
        });

        if (endpoint.requestBody != null) {
            parameters.push(
                new Parameter({
                    name: "request",
                    type: new Type({ name: "Any" })
                })
            );
        }

        return new Function({
            name: functionName,
            parameters,
            returnType: new Type({ name: "Any" }),
            modifiers: ["suspend"],
            body: 'TODO("Implement endpoint")',
            docs: endpoint.docs ?? undefined
        });
    }
}
