/**
 * Implemented by generated types that are XML elements (e.g. TwiML verbs).
 */
public interface XmlSerializable {

    /**
     * Serializes this object as an XML element. Root elements (elements that are never nested inside another
     * element) include the XML declaration.
     */
    String toXml();

    /**
     * Serializes this object as an XML element, optionally prefixed with the XML declaration.
     */
    String toXml(boolean xmlDeclaration);
}
