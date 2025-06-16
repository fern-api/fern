import { DescField, DescMessage } from "@bufbuild/protobuf";
import { CodeGeneratorRequest } from "@bufbuild/protobuf/wkt";
import { FileInfo, Printable } from "@bufbuild/protoplugin";

import { constructCasingsGenerator } from "@fern-api/casings-generator";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { mergeIntermediateRepresentation } from "@fern-api/ir-utils";
import { createLogger } from "@fern-api/logger";
import { ErrorCollector } from "@fern-api/v2-importer-commons";

import { ProtobufConverterContext } from "./ProtobufConverterContext";
import { ProtobufConverter } from "./converters/ProtobufConverter";
import { Options } from "./parseOptions";

export function generateIr({ req, options }: { req: CodeGeneratorRequest; options: Options }): FileInfo {
    let mergedIr: IntermediateRepresentation | undefined;

    // TODO: Initialize Protobuf Converter
    // TODO: Run ProtobufConverter.convert()

    const protobufConverter = new ProtobufConverter({
        breadcrumbs: [],
        context: new ProtobufConverterContext({
            spec: req,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            settings: {} as any,
            errorCollector: new ErrorCollector({
                logger: {
                    log: (level, ...args) => {}
                },
                relativeFilepathToSpec: undefined
            }),
            logger: createLogger((level, ...args) => {}),
            generationLanguage: undefined,
            smartCasing: false,
            exampleGenerationArgs: {
                disabled: true
            },
            enableUniqueErrorsPerEndpoint: false,
            generateV1Examples: false
        }),
        audiences: {
            type: "all"
        }
    });

    const result = protobufConverter.convert();
    const casingsGenerator = constructCasingsGenerator({
        generationLanguage: undefined,
        keywords: undefined,
        smartCasing: false
    });

    // TODO: run mergeIntermediateRepresentations on protobuf output

    if (result != null) {
        mergedIr =
            mergedIr === undefined ? result : mergeIntermediateRepresentation(mergedIr, result, casingsGenerator);
    }

    return {
        name: "ir.json",
        content: `${JSON.stringify(mergedIr)}`
    };
}

function getPrintableFromMessage(message: DescMessage): Printable {
    // TODO: Implement me!
    const printable: Printable = [];
    return printable;
}

function getPrintableFromField(field: DescField): Printable {
    // TODO: Implement me!
    const printable: Printable = [];
    return printable;
}
