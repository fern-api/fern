using global::System.Xml.Linq;
using <%= namespace%>.Core;

namespace <%= namespace%>;

/// <summary>
/// A generic XML element. Used to carry child elements that are not part of the typed model
/// (for example, elements introduced after the SDK was generated) so they survive a
/// <c>FromXml</c> / <c>ToXml</c> round trip, and to append arbitrary elements to a model.
/// Text segments and child elements live in a single ordered <see cref="Content"/> list, so
/// mixed content keeps its order.
/// </summary>
public sealed class XmlElement : IXmlNode, IEquatable<XmlElement>
{
    public XmlElement(string name, string? text = null, string? @namespace = null, string? prefix = null)
    {
        Name = name;
        Namespace = @namespace;
        Prefix = prefix;
        if (text != null)
        {
            Content.Add(text);
        }
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
    /// The element's content in document order: <see cref="string"/> text segments and
    /// <see cref="IXmlNode"/> child elements.
    /// </summary>
    public List<object> Content { get; set; } = new();

    /// <summary>
    /// The concatenated text content of the element, or null when it has none. Setting it replaces
    /// every text segment with a single one placed before the child elements.
    /// </summary>
    public string? Text
    {
        get => XmlUtils.ConcatText(Content);
        set
        {
            Content.RemoveAll(item => item is string);
            if (value != null)
            {
                Content.Insert(0, value);
            }
        }
    }

    /// <summary>
    /// Attributes in document order.
    /// </summary>
    public Dictionary<string, string> Attributes { get; set; } = new();

    /// <summary>
    /// Child elements in document order (a snapshot derived from <see cref="Content"/>).
    /// </summary>
    public IReadOnlyList<IXmlNode> Children => Content.OfType<IXmlNode>().ToList();

    /// <summary>
    /// When this element was parsed as the wrapper of a wrapped list property, the number of typed
    /// items it held. Used to deal the items back out to repeated wrappers when serializing.
    /// </summary>
    internal int WrappedItemCount { get; set; }

    /// <summary>
    /// Namespace declarations (prefix to URI) required by prefixed <see cref="Attributes"/>.
    /// </summary>
    public Dictionary<string, string> Namespaces { get; set; } = new();

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
        Content.Add(child);
        return this;
    }

    /// <summary>
    /// Appends a text segment (after any content added so far) and returns this element for chaining.
    /// </summary>
    public XmlElement AddText(string text)
    {
        Content.Add(text);
        return this;
    }

    public XElement ToXElement()
    {
        var element = XmlUtils.CreateElement(Name, Namespace, Prefix);
        foreach (var ns in Namespaces)
        {
            if (element.GetNamespaceOfPrefix(ns.Key) == null)
            {
                element.Add(new XAttribute(XNamespace.Xmlns + ns.Key, ns.Value));
            }
        }
        foreach (var attribute in Attributes)
        {
            XmlUtils.SetAttribute(element, attribute.Key, attribute.Value);
        }
        foreach (var item in Content)
        {
            element.Add(XmlUtils.ToXNode(item));
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
            null,
            element.Name.NamespaceName == "" ? null : element.Name.NamespaceName,
            XmlUtils.GetPrefix(element)
        );
        foreach (var attribute in element.Attributes())
        {
            if (attribute.IsNamespaceDeclaration)
            {
                continue;
            }
            var name = XmlUtils.GetAttributeName(attribute);
            var colon = name.IndexOf(':');
            if (colon > 0 && attribute.Name.Namespace != XNamespace.Xml)
            {
                result.Namespaces[name.Substring(0, colon)] = attribute.Name.NamespaceName;
            }
            result.Attributes[name] = attribute.Value;
        }
        result.Content = XmlUtils.ReadContent(element, null, false, null, null);
        return result;
    }

    public override string ToString() => ToXml();

    public bool Equals(XmlElement? other) => other != null && ToXml() == other.ToXml();

    public override bool Equals(object? obj) => Equals(obj as XmlElement);

    /// <summary>
    /// Hashes on <see cref="Name"/> only: the element is mutable, so hashing the full content
    /// would break hash-based collections when an element is modified after insertion.
    /// </summary>
    public override int GetHashCode() => Name.GetHashCode();
}
