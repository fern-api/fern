using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using global::System.Xml.Linq;
using SeedApi.Core;

namespace SeedApi;

/// <summary>
/// Adding a Pause in &lt;Say&gt;
/// </summary>
[Serializable]
public record Break : IJsonOnDeserialized, IXmlNode
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// Set a pause based on strength
    /// </summary>
    [JsonPropertyName("strength")]
    public BreakStrength? Strength { get; set; }

    /// <summary>
    /// Set a pause to a specific length of time in seconds or milliseconds, available values: [number]s, [number]ms
    /// </summary>
    [JsonPropertyName("time")]
    public string? Time { get; set; }

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
    /// Parses a <c>&lt;break&gt;</c> XML document. Throws <see cref="ArgumentException"/> if the XML is malformed or the root element does not match.
    /// </summary>
    public static Break FromXml(string xml) => FromXElement(XmlUtils.ParseRoot(xml, "break"));

    /// <summary>
    /// Reads this value from an already-parsed XML element.
    /// </summary>
    public static Break FromXElement(XElement element)
    {
        XmlUtils.RequireName(element, "break");
        var content = XmlUtils.ReadContent(element, null, false, null, null);
        var result = new Break
        {
            Strength = XmlUtils.ParseValue<BreakStrength?>(
                XmlUtils.GetAttribute(element, "strength")
            ),
            Time = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "time")),
            AdditionalAttributes = XmlUtils.GetAdditionalAttributes(element, "strength", "time"),
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
        var element = XmlUtils.CreateElement("break", null, null);
        XmlUtils.SetAttribute(element, "strength", XmlUtils.ToXmlString(Strength));
        XmlUtils.SetAttribute(element, "time", XmlUtils.ToXmlString(Time));
        XmlUtils.AddContent(element, XmlUtils.OrderContent(Content));
        XmlUtils.SetAttributes(element, AdditionalAttributes);
        return element;
    }

    /// <summary>
    /// Serializes this value to an XML string.
    /// </summary>
    public string ToXml() => XmlUtils.Serialize(ToXElement());

    /// <summary>
    /// Adds an arbitrary child element (for elements not covered by the typed model) after any content added so far and returns this instance for chaining.
    /// </summary>
    public Break AddChild(XmlElement child)
    {
        Content.Add(child);
        return this;
    }

    /// <summary>
    /// Appends a text segment after any content added so far, so text can be interleaved with child elements, and returns this instance for chaining.
    /// </summary>
    public Break AddText(string text)
    {
        Content.Add(text);
        return this;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
