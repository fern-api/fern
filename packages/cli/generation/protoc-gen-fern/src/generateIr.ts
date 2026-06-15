import { DescField, DescMessage } from "@bufbuild/protobuf";
import { CodeGeneratorRequest } from "@bufbuild/protobuf/wkt";
import { FileInfo, Printable } from "@bufbuild/protoplugin";

import { constructCasingsGenerator } from "@fern-api/casings-generator";
import { IntermediateRepresentation, serialization } from "@fern-api/ir-sdk";
import { mergeIntermediateRepresentation } from "@fern-api/ir-utils";
import { ErrorCollector } from "@fern-api/v3-importer-commons";

import { Logger } from "./commons/logging.js";
import { ProtofileConverter } from "./converters/ProtofileConverter.js";
import { ProtofileConverterContext } from "./converters/ProtofileConverterContext.js";
import { createGlobalCommentsStore } from "./converters/utils/CreateGlobalCommentsStore.js";
import { Options } from "./parseOptions.js";

export function generateIr({ req, options }: { req: CodeGeneratorRequest; options: Options }): FileInfo {
    let mergedIr: IntermediateRepresentation | undefined;

    const casingsGenerator = constructCasingsGenerator({
        generationLanguage: undefined,
        keywords: undefined,
        smartCasing: false
    });

    // Detect packages that have service name collisions with other packages.
    // All services in affected packages get split group parts so generators
    // produce distinct SDK accessors with a consistent subpackage hierarchy.
    const packagesWithDuplicates = detectPackagesWithDuplicateServices(req);

    for (const protoFile of req.protoFile) {
        const protoFileConverter = new ProtofileConverter({
            context: new ProtofileConverterContext({
                codeGeneratorRequest: req,
                spec: protoFile,
                packagesWithDuplicates,
                // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                settings: {} as any,
                errorCollector: new ErrorCollector({
                    logger: {
                        // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
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
                generateV1Examples: false,
                comments: createGlobalCommentsStore(protoFile)
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

    const serializedIr = serialization.IntermediateRepresentation.json(mergedIr, {
        allowUnrecognizedEnumValues: true,
        skipValidation: true
    });

    if (serializedIr.ok) {
        return {
            name: "ir.json",
            content: JSON.stringify(serializedIr.value, null, 2)
        };
    } else {
        return {
            name: "ir.json",
            content: JSON.stringify(serializedIr.errors, null, 2)
        };
    }
}

/**
 * Scans all proto files in the request and returns the set of proto packages
 * that contain at least one service whose bare name collides with a service in
 * another package. All services in these packages use package-split group parts
 * to ensure a consistent subpackage hierarchy.
 */
export function detectPackagesWithDuplicateServices(req: CodeGeneratorRequest): Set<string> {
    const serviceNameToPackages = new Map<string, Set<string>>();
    for (const protoFile of req.protoFile) {
        for (const service of protoFile.service) {
            const existing = serviceNameToPackages.get(service.name);
            if (existing != null) {
                existing.add(protoFile.package);
            } else {
                serviceNameToPackages.set(service.name, new Set([protoFile.package]));
            }
        }
    }
    const affectedPackages = new Set<string>();
    for (const [_, packages] of serviceNameToPackages) {
        if (packages.size > 1) {
            for (const pkg of packages) {
                affectedPackages.add(pkg);
            }
        }
    }
    return affectedPackages;
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
