import { File } from "@fern-api/base-generator";

import { ModelGeneratorContext } from "./ModelGeneratorContext.js";
import { XmlTestGenerator } from "./object/XmlTestGenerator.js";

/** One Minitest spec per xml-encoded object type (e.g. every TwiML verb). */
export function generateXmlTests({ context }: { context: ModelGeneratorContext }): File[] {
    const files: File[] = [];
    for (const typeDeclaration of Object.values(context.ir.types)) {
        const xml = typeDeclaration.encoding?.xml;
        if (xml == null || typeDeclaration.shape.type !== "object") {
            continue;
        }
        files.push(new XmlTestGenerator(context, typeDeclaration, typeDeclaration.shape, xml).generate());
    }
    return files;
}
