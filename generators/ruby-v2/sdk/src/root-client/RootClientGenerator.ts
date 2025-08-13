import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { FernIr } from "@fern-fern/ir-sdk";
import {
    Subpackage
} from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { astNodeToCodeBlockWithComments } from "../utils/astNodeToCodeBlockWithComments";
import { Comments } from "../utils/comments";

const TOKEN_PARAMETER_NAME = "token";

export class RootClientGenerator extends FileGenerator<RubyFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    public doGenerate(): RubyFile {
        const rootModule = this.context.getRootModule();
        const class_ = ruby.class_({ name: this.context.getRootClientClassName() });

        class_.addMethod(this.getInitializeMethod());

        for (const subpackage of this.getSubpackages()) {
            // skip subpackages that have no endpoints (recursively)
            if (!this.context.subPackageHasEndpoints(subpackage)) {
                continue;
            }
            class_.addMethod(this.getSubpackageClientGetter(subpackage, rootModule));
        }
        rootModule.addStatement(class_);
        return new RubyFile({
            node: astNodeToCodeBlockWithComments(rootModule, [Comments.FrozenStringLiteral]),
            directory: this.getDirectory(),
            filename: this.getFilename(),
            customConfig: this.context.customConfig
        });
    }

    private getDirectory(): RelativeFilePath {
        return this.context.getRootFolderPath();
    }

    public getFilepath(): RelativeFilePath {
        return join(this.getDirectory(), RelativeFilePath.of(this.getFilename()));
    }

    private getFilename(): string {
        return "client.rb"
    }

    private getInitializeMethod(): ruby.Method {
        const parameters: ruby.KeywordParameter[] = [];

        const baseUrlParameter = ruby.parameters.keyword({
            name: "base_url",
            type: ruby.Type.nilable(ruby.Type.string()),
            initializer: undefined,
            docs: "Override the default base URL for the API, e.g., `https://api.example.com`"
        })
        parameters.push(baseUrlParameter);

        const authenticationParameter = this.getAuthenticationParameter();
        if (authenticationParameter != null) {
            parameters.push(authenticationParameter);
        }

        const method = ruby.method({
            name: "initialize",
            kind: ruby.MethodKind.Instance,
            parameters: {
                keyword: parameters
            },
            returnType: ruby.Type.class_(ruby.classReference({
                name: "Client",
                modules: [this.context.getRootModule().name],
                fullyQualified: true
            })),
        })

        method.addStatement(ruby.codeblock((writer) => {
            writer.write(`@raw_client = `);
            writer.writeNode(this.context.getRawClientClassReference());
            writer.writeLine(`.new(`)
            writer.indent();
            writer.writeLine(`base_url: base_url,`)
            writer.writeLine(`headers: ${this.getRawClientHeaders()}`)
            writer.dedent();
            writer.writeLine(`)`)
        }))

        return method;
    }

    private getAuthenticationParameter(): ruby.KeywordParameter | undefined {
        for (const scheme of this.context.ir.auth.schemes) {
            switch (scheme.type) {
                case "bearer":
                    return ruby.parameters.keyword({
                        name: TOKEN_PARAMETER_NAME,
                        type: ruby.Type.string(),
                        initializer: scheme.tokenEnvVar != null ? undefined : ruby.codeblock((writer) => {
                            writer.write(`ENV.fetch("${scheme.tokenEnvVar}", nil)`)
                        }),
                        optional: scheme.tokenEnvVar == null,
                        docs: undefined
                    })
                default:
                    return undefined;
            }
        }

        return undefined;
    }

    private getRawClientHeaders(): ruby.TypeLiteral {
        const headers: ruby.HashEntry[] = [];

        if (this.context.ir.sdkConfig.platformHeaders.userAgent != null) {
            headers.push({
                key: ruby.TypeLiteral.string("User-Agent"),
                value: ruby.TypeLiteral.string(this.context.ir.sdkConfig.platformHeaders.userAgent.value)
            })
        }

        headers.push({
            key: ruby.TypeLiteral.string(this.context.ir.sdkConfig.platformHeaders.language),
            value: ruby.TypeLiteral.string("Ruby")
        })

        for (const header of this.context.ir.auth.schemes) {
            switch (header.type) {
                case "bearer":
                    headers.push({
                        key: ruby.TypeLiteral.string("Authorization"),
                        value: ruby.TypeLiteral.string(`Bearer #{${TOKEN_PARAMETER_NAME}}`)
                    })
                    break;
                default:
                    break;
            }
        }
        
        return ruby.TypeLiteral.hash(headers);
    }

    private getSubpackageClientGetter(subpackage: FernIr.Subpackage, rootModule: ruby.Module_): ruby.Method {
        return new ruby.Method({
            name: subpackage.name.camelCase.safeName,
            kind: ruby.MethodKind.Instance,
            returnType: ruby.Type.class_(
                ruby.classReference({
                    name: "Client",
                    modules: [rootModule.name, subpackage.name.pascalCase.safeName],
                    fullyQualified: true
                })
            ),
            statements: [
                ruby.codeblock((writer) => {
                    writer.writeLine(
                        `@${subpackage.name.camelCase.safeName} ||= ` +
                            `${rootModule.name}::` +
                            `${subpackage.name.pascalCase.safeName}::` +
                            `Client.new(client: @raw_client)`
                    );
                })
            ]
        });
    }

    private getSubpackages(): Subpackage[] {
        return this.context.ir.rootPackage.subpackages.map((subpackageId) => {
            return this.context.getSubpackageOrThrow(subpackageId);
        });
    }
}
