import { IntermediateRepresentation } from "@fern-api/api";
import { FernWriters, getTextOfTsNode, TypeResolver } from "@fern-typescript/commons";
import { ts, tsMorph } from "@fern-typescript/helper-utils";
import { HathoraEncoderConstants } from "../constants";
import { writeContainers } from "./containers/writeContainers";
import { writeModel } from "./model/writeModel";
import { writePrimitives } from "./primitives/writePrimitives";
import { writeServices } from "./services/writeServices";

export declare namespace writeEncoder {
    export interface Args {
        file: tsMorph.SourceFile;
        modelDirectory: tsMorph.Directory;
        servicesDirectory: tsMorph.Directory;
        intermediateRepresentation: IntermediateRepresentation;
        typeResolver: TypeResolver;
    }
}

export function writeEncoder({
    file,
    intermediateRepresentation,
    typeResolver,
    modelDirectory,
    servicesDirectory,
}: writeEncoder.Args): void {
    file.addImportDeclaration({
        namespaceImport: HathoraEncoderConstants.BinSerDe.NAMESPACE_IMPORT,
        moduleSpecifier: "bin-serde",
    });

    const objectWriter = FernWriters.object.writer({ newlinesBetweenProperties: true });
    objectWriter.addProperties({
        [HathoraEncoderConstants.Primitives.NAME]: writePrimitives(),
        [HathoraEncoderConstants.Containers.NAME]: writeContainers(),
        [HathoraEncoderConstants.Model.NAME]: writeModel({
            types: intermediateRepresentation.types,
            typeResolver,
            file,
            modelDirectory,
        }),
        [HathoraEncoderConstants.Services.NAME]: writeServices({
            services: intermediateRepresentation.services,
            typeResolver,
            file,
            modelDirectory,
            servicesDirectory,
        }),
        [HathoraEncoderConstants.Errors.NAME]: getTextOfTsNode(ts.factory.createStringLiteral("TODO")),
    });

    file.addVariableStatement({
        declarationKind: tsMorph.VariableDeclarationKind.Const,
        declarations: [
            {
                name: HathoraEncoderConstants.NAME,
                initializer: objectWriter.toFunction(),
            },
        ],
        isExported: true,
    });
}
