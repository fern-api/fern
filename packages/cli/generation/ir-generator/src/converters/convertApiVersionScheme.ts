import { ApiVersionScheme, EnumTypeDeclaration, HttpHeader } from "@fern-api/ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../FernFileContext";
import { convertHttpHeader } from "./services/convertHttpService";
import { convertEnumTypeDeclaration } from "./type-declarations/convertEnumTypeDeclaration";

export async function convertApiVersionScheme({
    file,
    rawApiFileSchema
}: {
    file: FernFileContext;
    rawApiFileSchema: RawSchemas.RootApiFileSchema;
}): Promise<ApiVersionScheme | undefined> {
    if (rawApiFileSchema.version == null) {
        return undefined;
    }
    return ApiVersionScheme.header({
        header: await convertHeader({
            file,
            header: rawApiFileSchema.version.header
        }),
        value: await convertEnum({
            file,
            versionDeclaration: rawApiFileSchema.version
        })
    });
}

async function convertHeader({
    file,
    header
}: {
    file: FernFileContext;
    header: RawSchemas.VersionDeclarationHeaderSchema;
}): Promise<HttpHeader> {
    if (typeof header === "string") {
        return await convertHttpHeader({
            file,
            headerKey: header,
            header: {
                type: "string"
            }
        });
    }
    return await convertHttpHeader({
        file,
        headerKey: header.value,
        header: {
            type: "string",
            name: header.name,
            env: header.env
        }
    });
}

async function convertEnum({
    file,
    versionDeclaration
}: {
    file: FernFileContext;
    versionDeclaration: RawSchemas.VersionDeclarationSchema;
}): Promise<EnumTypeDeclaration> {
    return await convertEnumTypeDeclaration({
        _enum: {
            default: versionDeclaration.default,
            enum: versionDeclaration.values
        },
        file
    });
}
