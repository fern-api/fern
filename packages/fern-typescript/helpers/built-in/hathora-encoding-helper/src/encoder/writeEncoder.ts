import { IntermediateRepresentation } from "@fern-api/api";
import { FernWriters } from "@fern-typescript/commons";
import { createPrinter, TsMorph, tsMorph } from "@fern-typescript/helper-utils";
import { HathoraEncoderConstants } from "../constants";
import { writeContainers } from "./containers/writeContainers";
import { writePrimitives } from "./writePrimitives";

export declare namespace writeEncoder {
    export interface Args {
        file: tsMorph.SourceFile;
        modelDirectory: tsMorph.Directory;
        intermediateRepresentation: IntermediateRepresentation;
        tsMorph: TsMorph;
    }
}

export function writeEncoder({ file, tsMorph, tsMorph: { ts } }: writeEncoder.Args): void {
    const printNode = createPrinter(tsMorph);

    file.addImportDeclaration({
        namespaceImport: HathoraEncoderConstants.BinSerDe.NAMESPACE_IMPORT,
        moduleSpecifier: "bin-serde",
    });

    const objectWriter = FernWriters.object.writer({ newlinesBetweenProperties: true });
    objectWriter.addProperties({
        [HathoraEncoderConstants.Primitives.NAME]: writePrimitives(tsMorph),
        [HathoraEncoderConstants.Containers.NAME]: writeContainers(tsMorph),
        [HathoraEncoderConstants.Model.NAME]: printNode(ts.factory.createStringLiteral("TODO")),
        [HathoraEncoderConstants.Services.NAME]: printNode(ts.factory.createStringLiteral("TODO")),
        [HathoraEncoderConstants.Errors.NAME]: printNode(ts.factory.createStringLiteral("TODO")),
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
