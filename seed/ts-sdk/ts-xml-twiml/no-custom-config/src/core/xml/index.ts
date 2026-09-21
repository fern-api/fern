export { isXmlBuilder, type XmlBuilder, xmlBuild, xmlBuildAll } from "./builder.js";
export { localName, parseXml, type XmlNode, XmlParseError } from "./parse.js";
export {
    type XmlNodeParser,
    type XmlScalarParser,
    xmlAttribute,
    xmlBigInt,
    xmlBoolean,
    xmlChild,
    xmlChildren,
    xmlDate,
    xmlEnum,
    xmlExtraAttributes,
    xmlInteger,
    xmlNumber,
    xmlRequired,
    xmlScalar,
    xmlScalarChild,
    xmlScalarList,
    xmlString,
    xmlText,
    xmlToSet,
    xmlUnknownChildren,
} from "./read.js";
export {
    escapeXml,
    extraXmlAttributes,
    formatXmlScalar,
    isXmlSerializable,
    type SerializeXmlElementArgs,
    serializeXmlElement,
    XML_DECLARATION,
    type XmlAttribute,
    type XmlChild,
    type XmlSerializable,
} from "./serialize.js";
export { XmlElement } from "./XmlElement.js";
