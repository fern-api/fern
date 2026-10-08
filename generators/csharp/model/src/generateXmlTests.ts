import { CSharpFile } from "@fern-api/csharp-base";

import { ModelGeneratorContext } from "./ModelGeneratorContext.js";
import { XmlSerializationTestGenerator } from "./object/XmlSerializationTestGenerator.js";

/** One NUnit round-trip test fixture per xml-encoded object type (e.g. every TwiML verb). */
export function generateXmlTests({ context }: { context: ModelGeneratorContext }): CSharpFile[] {
    const files: CSharpFile[] = [];
    for (const typeDeclaration of Object.values(context.ir.types)) {
        const xml = typeDeclaration.encoding?.xml;
        if (xml == null || typeDeclaration.shape.type !== "object") {
            continue;
        }
        files.push(new XmlSerializationTestGenerator(context, typeDeclaration, typeDeclaration.shape, xml).generate());
    }
    return files;
}
