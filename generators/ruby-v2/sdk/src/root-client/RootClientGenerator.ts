import { assertNever } from "@fern-api/core-utils";
import { RubyFile, FileGenerator } from "@fern-api/ruby-base";
import { ruby } from "@fern-api/ruby-ast";
import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { astNodeToCodeBlockWithComments } from "../utils/astNodeToCodeBlockWithComments";
import { Comments } from "../utils/comments";

import {
    AuthScheme,
    HttpHeader,
    Literal,
    OAuthScheme,
    PrimitiveTypeV1,
    PrimitiveTypeV2,
    ServiceId,
    Subpackage,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export const CLIENT_MEMBER_NAME = "_client";
export const GRPC_CLIENT_MEMBER_NAME = "_grpc";

const GetFromEnvironmentOrThrow = "GetFromEnvironmentOrThrow";
const CLIENT_OPTIONS_PARAMETER_NAME = "clientOptions";

interface ConstructorParameter {
    name: string;
    docs?: string;
    isOptional: boolean;
    typeReference: TypeReference;
    /**
     * The header associated with this parameter
     */
    header?: HeaderInfo;
    environmentVariable?: string;
}

interface LiteralParameter {
    name: string;
    value: Literal;
    header?: HeaderInfo;
}

interface HeaderInfo {
    name: string;
    prefix?: string;
}

export class RootClientGenerator extends FileGenerator<RubyFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    public doGenerate(): RubyFile {

        const rootModule = this.context.getRootModule();
        const class_ = ruby.class_({ name: this.context.getRootClientClassName() });
        for (const subpackage of this.getSubpackages()) {
            // skip subpackages that have no endpoints (recursively)
            if (!this.context.subPackageHasEndpoints(subpackage)) {
                continue;
            }
            class_.addMethod(this.getSubpackageClientGetter(subpackage, rootModule, class_));
        }
        rootModule.addStatement(class_);
        return new RubyFile({
            node: astNodeToCodeBlockWithComments(rootModule, [Comments.FrozenStringLiteral]),
            directory: this.getDirectory(),
            filename: this.getFilepath(),
            customConfig: this.context.customConfig
        });
    }

    private getDirectory(): RelativeFilePath {
        return RelativeFilePath.of("");
    }
    private getFilename(): string {
        return this.context.getRootClientClassName() + ".rb";
    }

    public getFilepath(): RelativeFilePath {
        return join(
            this.getDirectory(),
            RelativeFilePath.of(this.getFilename())
        );
    }

    private getSubpackageClientGetter(subpackage: FernIr.Subpackage, rootModule: ruby.Module_, rootClientClass: ruby.Class_): ruby.Method {
        return new ruby.Method({
            name: subpackage.name.camelCase.safeName,
            kind: ruby.MethodKind.Instance,
            // TODO: Add the correct return type
            returnType: ruby.Type.string(),
            statements: [
                ruby.codeblock((writer) => {
                    writer.writeLine(
                        `@${subpackage.name.camelCase.safeName} ||= ` +
                        `${rootModule.name}::` +
                        `${subpackage.name.pascalCase.safeName}::` +
                        `Client.new(client: @raw_client)`
                    )
                })
            ]
        })
    }

    private getSubpackages(): Subpackage[] {
        return this.context.ir.rootPackage.subpackages.map((subpackageId) => {
            return this.context.getSubpackageOrThrow(subpackageId);
        });
    }
}