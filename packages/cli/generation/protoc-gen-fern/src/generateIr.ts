import { DescField, DescMessage } from "@bufbuild/protobuf";
import { CodeGeneratorRequest } from "@bufbuild/protobuf/wkt";
import { FileInfo, Printable } from "@bufbuild/protoplugin";

import { constructCasingsGenerator } from "@fern-api/casings-generator";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { mergeIntermediateRepresentation } from "@fern-api/ir-utils";
import { ErrorCollector } from "@fern-api/v2-importer-commons";

import { Logger } from "./commons/logging";
import { ProtofileConverter } from "./converters/ProtofileConverter";
import { ProtofileConverterContext } from "./converters/ProtofileConverterContext";
import { Options } from "./parseOptions";

export function generateIr({ req, options }: { req: CodeGeneratorRequest; options: Options }): FileInfo {
    let mergedIr: IntermediateRepresentation | undefined;

    const protobufConverter = new ProtobufConverter({
        breadcrumbs: [],
        context: new ProtobufConverterContext({
            spec: req,
            settings: {} as any,
            errorCollector: new ErrorCollector({
                logger: {
                    log: (level, ...args) => {
                        // do nothing.
                    }
                },
                relativeFilepathToSpec: undefined
            }),
            logger: createLogger((level, ...args) => {
                // do nothing.
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

    for (const protoFile of req.protoFile) {
        const protoFileConverter = new ProtofileConverter({
            context: new ProtofileConverterContext({
                spec: protoFile,
                settings: {} as any,
                errorCollector: new ErrorCollector({
                    logger: {
                        log: (level, ...args) => {}
                    },
                    relativeFilepathToSpec: undefined
                }),
                logger: new Logger(),
                generationLanguage: undefined,
                smartCasing: false,
                exampleGenerationArgs: {
                    disabled: true
                },
                enableUniqueErrorsPerEndpoint: false,
                generateV1Examples: false
            }),
            breadcrumbs: [],
            audiences: {
                type: "all"
            }
        });
        const convertedProtoFile = protoFileConverter.convert();
        if (convertedProtoFile != null) {
            mergedIr =
                mergedIr === undefined
                    ? convertedProtoFile
                    : mergeIntermediateRepresentation(mergedIr, convertedProtoFile, casingsGenerator);
        }
    }

    return {
        name: "ir.json",
        content: `${JSON.stringify(mergedIr, null, 2)}`
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
