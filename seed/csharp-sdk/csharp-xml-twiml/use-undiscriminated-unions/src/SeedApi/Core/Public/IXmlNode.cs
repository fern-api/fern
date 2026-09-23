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
    /// Serializes this value to an XML string (no XML declaration).
    /// </summary>
    string ToXml();
}
