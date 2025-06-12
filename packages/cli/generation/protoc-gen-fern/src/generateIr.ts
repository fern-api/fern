import { DescField, DescMessage } from "@bufbuild/protobuf";
import { CodeGeneratorRequest } from "@bufbuild/protobuf/wkt";
import { FileInfo, Printable } from "@bufbuild/protoplugin";

import { constructCasingsGenerator } from "@fern-api/casings-generator";
// import { createLogger } from "@fern-api/logger";
// import { mergeIntermediateRepresentations } from "@fern-api/ir-utils";
// import { ProtobufConverter } from "./converters/ProtobufConverter";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { mergeIntermediateRepresentation } from "@fern-api/ir-utils";
// import { mergeIntermediateRepresentation } from "@fern-api/ir-utils";
// import { constructCasingsGenerator } from "@fern-api/casings-generator";
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
            settings: undefined,
            errorCollector: new ErrorCollector({
                logger: {
                    log: (level, ...args) => {}
                },
                relativeFilepathToSpec: undefined
            }),
            logger: createLogger((level, ...args) => {
                console.log(level, ...args);
            }),
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
        content: `${JSON.stringify(result)}`
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
