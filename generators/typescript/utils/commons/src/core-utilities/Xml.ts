import { Reference } from "../referencing/Reference.js";
import { CoreUtility } from "./CoreUtility.js";

export type XmlExport =
    | "XmlNode"
    | "XmlElement"
    | "XmlSerializable"
    | "XmlNodeParser"
    | "XmlBuilder"
    | "xmlBuild"
    | "xmlBuildAll"
    | "XML_DECLARATION"
    | "parseXml"
    | "serializeXmlElement"
    | "extraXmlAttributes"
    | "xmlAttribute"
    | "xmlText"
    | "xmlScalar"
    | "xmlScalarList"
    | "xmlToSet"
    | "xmlScalarChild"
    | "xmlRequired"
    | "xmlChild"
    | "xmlChildren"
    | "xmlExtraAttributes"
    | "xmlUnknownChildren"
    | "xmlString"
    | "xmlInteger"
    | "xmlNumber"
    | "xmlBoolean"
    | "xmlBigInt"
    | "xmlDate"
    | "xmlEnum";

export interface Xml {
    getReferenceToExport: (exportedName: XmlExport) => Reference;
}

export const MANIFEST: CoreUtility.Manifest = {
    name: "xml",
    pathInCoreUtilities: { nameOnDisk: "xml", exportDeclaration: { namespaceExport: "xml" } },
    getFilesPatterns: () => ({
        patterns: ["src/core/xml/**", "tests/unit/xml/**"]
    })
};

export class XmlImpl extends CoreUtility implements Xml {
    public readonly MANIFEST = MANIFEST;

    public getReferenceToExport(exportedName: XmlExport): Reference {
        return this.withExportedName(exportedName, (reference: Reference) => () => reference)();
    }
}
