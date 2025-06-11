import { DescField, DescMessage } from "@bufbuild/protobuf";
import { CodeGeneratorRequest } from "@bufbuild/protobuf/wkt";
import { FileInfo, Printable } from "@bufbuild/protoplugin";

import { Options } from "./parseOptions";

// import { mergeIntermediateRepresentations } from "@fern-api/ir-utils";
// import { ProtobufConverter } from "./converters/ProtobufConverter";
import { ProtobufConverterContext } from "./ProtobufConverterContext";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { mergeIntermediateRepresentation } from "@fern-api/ir-utils";
import { constructCasingsGenerator } from "@fern-api/casings-generator";

export function generateIr({ req, options }: { req: CodeGeneratorRequest; options: Options }): FileInfo {
    // TODO: Initialize Protobuf Converter
    // TODO: Run ProtobufConverter.convert()
    // TODO: run mergeIntermediateRepresentations on protobuf output

    // let mergedIr: IntermediateRepresentation | undefined;

    // const protobufConverter = new ProtobufConverter({
    //     breadcrumbs: [],
    //     context: new ProtobufConverterContext({
    //         spec: req,
    //         settings: options.settings
    //     })
    // });

    // const result = protobufConverter.convert();

    // const casingsGenerator = constructCasingsGenerator({
    //     generationLanguage: "typescript",
    //     keywords: undefined,
    //     smartCasing: false
    // });

    // if (result != null) {
    //     mergedIr =
    //         mergedIr === undefined
    //             ? result
    //             : mergeIntermediateRepresentation(mergedIr, result, casingsGenerator);
    // }

    return {
        name: "ir.json",
        content: `${JSON.stringify(req)}`
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
