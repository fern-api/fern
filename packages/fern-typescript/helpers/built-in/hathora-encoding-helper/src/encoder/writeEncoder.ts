import { IntermediateRepresentation } from "@fern-api/api";
import { createPrinter, TsMorph, tsMorph } from "@fern-typescript/helper-utils";
import { HathoraEncoderConstants } from "../constants";
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

    file.addVariableStatement({
        declarationKind: tsMorph.VariableDeclarationKind.Const,
        declarations: [
            {
                name: HathoraEncoderConstants.NAME,
                initializer: tsMorph.Writers.object({
                    [HathoraEncoderConstants.Primitives.NAME]: printNode(writePrimitives({ ts })),
                    [HathoraEncoderConstants.Containers.NAME]: printNode(ts.factory.createStringLiteral("TODO")),
                    [HathoraEncoderConstants.Model.NAME]: printNode(ts.factory.createStringLiteral("TODO")),
                    [HathoraEncoderConstants.Services.NAME]: printNode(ts.factory.createStringLiteral("TODO")),
                    [HathoraEncoderConstants.Errors.NAME]: printNode(ts.factory.createStringLiteral("TODO")),
                }),
            },
        ],
        isExported: true,
    });
}
