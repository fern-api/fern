import { DescField, DescMessage } from "@bufbuild/protobuf";
import { CodeGeneratorRequest } from "@bufbuild/protobuf/wkt";
import { FileInfo, Printable } from "@bufbuild/protoplugin";

import { Options } from "./parseOptions";

export function generateIr({ req, options }: { req: CodeGeneratorRequest; options: Options }): FileInfo {
    // TODO: Implement me!
    return {
        name: "ir.json",
        content: "{}"
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
