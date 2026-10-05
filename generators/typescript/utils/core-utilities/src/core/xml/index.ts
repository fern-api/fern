export { type XmlBuilder, isXmlBuilder, xmlBuild, xmlBuildAll } from "./builder";
export { type XmlNode, XmlParseError, localName, parseXml } from "./parse";
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
} from "./read";
export {
    type SerializeXmlElementArgs,
    type XmlAttribute,
    type XmlChild,
    type XmlSerializable,
    XML_DECLARATION,
    escapeXml,
    extraXmlAttributes,
    formatXmlScalar,
    isXmlSerializable,
    serializeXmlElement,
} from "./serialize";
export { XmlElement } from "./XmlElement";
