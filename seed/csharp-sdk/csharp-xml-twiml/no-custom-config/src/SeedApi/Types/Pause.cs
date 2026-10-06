using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using global::System.Xml.Linq;
using SeedApi.Core;

namespace SeedApi;

/// <summary>
/// XML element without an explicit xml.name; falls back to the schema name.
/// </summary>
[Serializable]
public record Pause : IJsonOnDeserialized, IXmlNode
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("length")]
    public int? Length { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// XML attributes that are not part of the typed model. They are written back by ToXml().
    /// </summary>
    [JsonIgnore]
    public Dictionary<string, string> AdditionalAttributes { get; set; } = new();

    /// <summary>
    /// Ordered content of the element: text segments (string), comments (XmlComment), typed child elements and child elements that are not part of the typed model (XmlElement), in the order they are written. Typed children assigned directly to their property are appended after it.
    /// </summary>
    [JsonIgnore]
    public List<object> Content { get; set; } = new();

    /// <summary>
    /// Child elements that are not part of the typed model, derived from Content (a snapshot; add children through AddChild or Content).
    /// </summary>
    [JsonIgnore]
    public IReadOnlyList<XmlElement> AdditionalChildren => Content.OfType<XmlElement>().ToList();

    /// <summary>
    /// Parses a <c>&lt;Pause&gt;</c> XML document. Throws <see cref="ArgumentException"/> if the XML is malformed or the root element does not match.
    /// </summary>
    public static Pause FromXml(string xml) => FromXElement(XmlUtils.ParseRoot(xml, "Pause"));

    /// <summary>
    /// Reads this value from an already-parsed XML element.
    /// </summary>
    public static Pause FromXElement(XElement element)
    {
        XmlUtils.RequireName(element, "Pause");
        var content = XmlUtils.ReadContent(element, null, false, null, null);
        var result = new Pause
        {
            Length = XmlUtils.ParseValue<int?>(XmlUtils.GetAttribute(element, "length")),
            AdditionalAttributes = XmlUtils.GetAdditionalAttributes(element, "length"),
            Content = content,
        };
        return result;
    }

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <summary>
    /// Renders this value as an XML element.
    /// </summary>
    public XElement ToXElement()
    {
        var element = XmlUtils.CreateElement("Pause", null, null);
        XmlUtils.SetAttribute(element, "length", XmlUtils.ToXmlString(Length));
        XmlUtils.AddContent(element, XmlUtils.OrderContent(Content));
        XmlUtils.SetAttributes(element, AdditionalAttributes);
        return element;
    }

    /// <summary>
    /// Serializes this value to an XML document, prefixed with the XML declaration.
    /// </summary>
    public string ToXml() => ToXml(true);

    /// <summary>
    /// Serializes this value to an XML element, optionally prefixed with the XML declaration.
    /// </summary>
    public string ToXml(bool xmlDeclaration) => XmlUtils.Serialize(ToXElement(), xmlDeclaration);

    /// <summary>
    /// Adds an arbitrary child element (for elements not covered by the typed model) after any content added so far and returns this instance for chaining.
    /// </summary>
    public Pause AddChild(XmlElement child)
    {
        Content.Add(child);
        return this;
    }

    /// <summary>
    /// Appends a text segment after any content added so far, so text can be interleaved with child elements, and returns this instance for chaining.
    /// </summary>
    public Pause AddText(string text)
    {
        Content.Add(text);
        return this;
    }

    /// <summary>
    /// Appends an XML comment (&lt;!--text--&gt;) inside this element after any content added so far and returns this instance for chaining.
    /// </summary>
    public Pause Comment(string text)
    {
        Content.Add(new XmlComment(text));
        return this;
    }

    /// <summary>
    /// Adds an XML comment rendered immediately before this element (as a sibling in its parent, or before the root element) and returns this instance for chaining.
    /// </summary>
    public Pause CommentBefore(string text)
    {
        Content.Add(XmlComment.Before(text));
        return this;
    }

    /// <summary>
    /// Adds an XML comment rendered immediately after this element (as a sibling in its parent, or after the root element) and returns this instance for chaining.
    /// </summary>
    public Pause CommentAfter(string text)
    {
        Content.Add(XmlComment.After(text));
        return this;
    }

    /// <summary>
    /// Returns the XML representation of this value.
    /// </summary>
    public override string ToString() => ToXml();
}
