using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using global::System.Xml.Linq;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record Hangup : IJsonOnDeserialized, IXmlNode
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// XML attributes that are not part of the typed model. They are written back by ToXml().
    /// </summary>
    [JsonIgnore]
    public Dictionary<string, string> AdditionalAttributes { get; set; } = new();

    /// <summary>
    /// Ordered content of the element: text segments (string), typed child elements and child elements that are not part of the typed model (XmlElement), in the order they are written. Typed children assigned directly to their property are appended after it.
    /// </summary>
    [JsonIgnore]
    public List<object> Content { get; set; } = new();

    /// <summary>
    /// Child elements that are not part of the typed model, derived from Content (a snapshot; add children through AddChild or Content).
    /// </summary>
    [JsonIgnore]
    public IReadOnlyList<XmlElement> AdditionalChildren => Content.OfType<XmlElement>().ToList();

    /// <summary>
    /// Parses a <c>&lt;Hangup&gt;</c> XML document. Throws <see cref="ArgumentException"/> if the XML is malformed or the root element does not match.
    /// </summary>
    public static Hangup FromXml(string xml) => FromXElement(XmlUtils.ParseRoot(xml, "Hangup"));

    /// <summary>
    /// Reads this value from an already-parsed XML element.
    /// </summary>
    public static Hangup FromXElement(XElement element)
    {
        XmlUtils.RequireName(element, "Hangup");
        var content = XmlUtils.ReadContent(element, null, false, null, null);
        var result = new Hangup
        {
            AdditionalAttributes = XmlUtils.GetAdditionalAttributes(element),
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
        var element = XmlUtils.CreateElement("Hangup", null, null);
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
    public Hangup AddChild(XmlElement child)
    {
        Content.Add(child);
        return this;
    }

    /// <summary>
    /// Appends a text segment after any content added so far, so text can be interleaved with child elements, and returns this instance for chaining.
    /// </summary>
    public Hangup AddText(string text)
    {
        Content.Add(text);
        return this;
    }

    /// <summary>
    /// Returns the XML representation of this value.
    /// </summary>
    public override string ToString() => ToXml();
}
