using global::System.Xml.Linq;

namespace SeedApi;

/// <summary>
/// Implemented by XML-encoded models that can be rendered as an XML element.
/// </summary>
public interface IXmlNode
{
    /// <summary>
    /// Renders this value as an <see cref="XElement"/>.
    /// </summary>
    XElement ToXElement();

    /// <summary>
    /// Serializes this value to an XML string, optionally prefixed with the XML declaration.
    /// Generated element types default to including it; <see cref="XmlElement"/> defaults to omitting it.
    /// </summary>
    string ToXml(bool xmlDeclaration);
}
