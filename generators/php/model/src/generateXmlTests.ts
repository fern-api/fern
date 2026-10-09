import { ModelGeneratorContext } from "./ModelGeneratorContext.js";
import { XmlTestGenerator } from "./object/XmlTestGenerator.js";

/** One PHPUnit test case per xml-encoded object type (e.g. every TwiML verb). */
export function generateXmlTests(context: ModelGeneratorContext): void {
    for (const typeDeclaration of Object.values(context.ir.types)) {
        const xml = typeDeclaration.encoding?.xml;
        if (xml == null || typeDeclaration.shape.type !== "object") {
            continue;
        }
        context.project.addRawFiles(
            new XmlTestGenerator(context, typeDeclaration, typeDeclaration.shape, xml).generate()
        );
    }
}
