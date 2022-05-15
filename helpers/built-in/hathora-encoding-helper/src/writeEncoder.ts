import { IntermediateRepresentation } from "@fern-api/api";
import { createPrinter, tsMorph } from "@fern-typescript/helper-utils";
import { ENCODER_NAME } from "./constants";

export declare namespace writeEncoder {
    export interface Args {
        file: tsMorph.SourceFile;
        modelDirectory: tsMorph.Directory;
        intermediateRepresentation: IntermediateRepresentation;
        tsMorph: typeof tsMorph;
    }
}

export function writeEncoder({ file, tsMorph, tsMorph: { ts } }: writeEncoder.Args): void {
    const printNode = createPrinter(tsMorph);

    file.addVariableStatement({
        declarationKind: tsMorph.VariableDeclarationKind.Const,
        declarations: [
            {
                name: ENCODER_NAME,
                initializer: tsMorph.Writers.object({
                    Primitives: printNode(ts.factory.createStringLiteral("TODO")),
                    Model: printNode(ts.factory.createStringLiteral("TODO")),
                    Services: printNode(ts.factory.createStringLiteral("TODO")),
                    Errors: printNode(ts.factory.createStringLiteral("TODO")),
                }),
            },
        ],
        isExported: true,
    });
}
