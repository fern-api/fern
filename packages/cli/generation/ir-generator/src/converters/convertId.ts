import { RawSchemas, RAW_DEFAULT_ID_TYPE } from "@fern-api/yaml-schema";
import { TypeDeclaration } from "@fern-fern/ir-model/types";
import { FernFileContext } from "../FernFileContext";
import { TypeResolver } from "../type-resolver/TypeResolver";
import { getDocs } from "../utils/getDocs";
import { convertTypeDeclaration } from "./type-declarations/convertTypeDeclaration";

export function convertId({
    id,
    file,
    typeResolver,
}: {
    id: RawSchemas.IdSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): TypeDeclaration {
    return convertTypeDeclaration({
        typeName: typeof id === "string" ? id : id.name,
        typeDeclaration: {
            docs: getDocs(id),
            alias: typeof id === "string" || id.type == null ? RAW_DEFAULT_ID_TYPE : id.type,
        },
        file,
        typeResolver,
    });
}
