using global::System.Xml.Linq;
using SeedApi.Core;

namespace SeedApi;

/// <summary>
/// A generic XML element. Used to carry child elements that are not part of the typed model
/// (for example, elements introduced after the SDK was generated) so they survive a
/// <c>FromXml</c> / <c>ToXml</c> round trip, and to append arbitrary elements to a model.
/// </summary>
public sealed class XmlElement : IXmlNode, IEquatable<XmlElement>
{
    public XmlElement(
        string name,
        string? text = null,
        string? @namespace = null,
        string? prefix = null
    )
    {
        Name = name;
        Text = text;
        Namespace = @namespace;
        Prefix = prefix;
    }

    /// <summary>
    /// The local element name.
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// The element namespace URI, if any.
    /// </summary>
    public string? Namespace { get; set; }

    /// <summary>
    /// The namespace prefix to declare for <see cref="Namespace"/>, if any.
    /// </summary>
    public string? Prefix { get; set; }

    /// <summary>
    /// The text content of the element, if any.
    /// </summary>
    public string? Text { get; set; }

    /// <summary>
    /// Attributes in document order.
    /// </summary>
    public Dictionary<string, string> Attributes { get; set; } = new();

    /// <summary>
    /// Child elements in document order.
    /// </summary>
    public List<IXmlNode> Children { get; set; } = new();

    /// <summary>
    /// Sets an attribute and returns this element for chaining.
    /// </summary>
    public XmlElement SetAttribute(string name, string value)
    {
        Attributes[name] = value;
        return this;
    }

    /// <summary>
    /// Appends a child element and returns this element for chaining.
    /// </summary>
    public XmlElement AddChild(IXmlNode child)
    {
        Children.Add(child);
        return this;
    }

    public XElement ToXElement()
    {
        var element = XmlUtils.CreateElement(Name, Namespace, Prefix);
        foreach (var attribute in Attributes)
        {
            XmlUtils.SetAttribute(element, attribute.Key, attribute.Value);
        }
        if (Text != null)
        {
            element.Add(new XText(Text));
        }
        foreach (var child in Children)
        {
            element.Add(child.ToXElement());
        }
        return element;
    }

    public string ToXml() => XmlUtils.Serialize(ToXElement());

    /// <summary>
    /// Parses an XML document into an <see cref="XmlElement"/>.
    /// </summary>
    public static XmlElement FromXml(string xml) => FromXElement(XmlUtils.ParseDocument(xml));

    /// <summary>
    /// Converts an <see cref="XElement"/> (and its descendants) into an <see cref="XmlElement"/>.
    /// </summary>
    public static XmlElement FromXElement(XElement element)
    {
        var result = new XmlElement(
            element.Name.LocalName,
            XmlUtils.GetText(element),
            element.Name.NamespaceName == "" ? null : element.Name.NamespaceName,
            XmlUtils.GetPrefix(element)
        );
        foreach (var attribute in element.Attributes())
        {
            if (attribute.IsNamespaceDeclaration)
            {
                continue;
            }
            result.Attributes[XmlUtils.GetAttributeName(attribute)] = attribute.Value;
        }
        foreach (var child in element.Elements())
        {
            result.Children.Add(FromXElement(child));
        }
        return result;
    }

    public override string ToString() => ToXml();

    public bool Equals(XmlElement? other) => other != null && ToXml() == other.ToXml();

    public override bool Equals(object? obj) => Equals(obj as XmlElement);

    public override int GetHashCode() => ToXml().GetHashCode();
}
