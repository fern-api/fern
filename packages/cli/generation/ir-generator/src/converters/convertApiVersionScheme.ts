import { RawSchemas } from "@fern-api/fern-definition-schema";
import { ApiVersionScheme, EnumTypeDeclaration, HttpHeader } from "@fern-api/ir-sdk";

import { FernFileContext } from "../FernFileContext";
import { convertHttpHeader } from "./services/convertHttpService";
import { convertEnumTypeDeclaration } from "./type-declarations/convertEnumTypeDeclaration";

export function convertApiVersionScheme({
    file,
    rawApiFileSchema
}: {
    file: FernFileContext;
    rawApiFileSchema: RawSchemas.RootApiFileSchema;
}): ApiVersionScheme | undefined {
    if (rawApiFileSchema.version == null) {
        return undefined;
    }
    return ApiVersionScheme.header({
        header: convertHeader({
            file,
            header: rawApiFileSchema.version.header
        }),
        value: convertEnum({
            file,
            versionDeclaration: rawApiFileSchema.version
        })
    });
}

function convertHeader({
    file,
    header
}: {
    file: FernFileContext;
    header: RawSchemas.VersionDeclarationHeaderSchema;
}): HttpHeader {
    if (typeof header === "string") {
        return convertHttpHeader({
            file,
            headerKey: header,
            header: {
                type: "string"
            }
        });
    }
    return convertHttpHeader({
        file,
        headerKey: header.value,
        header: {
            type: "string",
            name: header.name,
            env: header.env
        }
    });
}

function convertEnum({
    file,
    versionDeclaration
}: {
    file: FernFileContext;
    versionDeclaration: RawSchemas.VersionDeclarationSchema;
}): EnumTypeDeclaration {
    return convertEnumTypeDeclaration({
        _enum: {
            default: versionDeclaration.default,
            enum: versionDeclaration.values
        },
        file
    });
}
