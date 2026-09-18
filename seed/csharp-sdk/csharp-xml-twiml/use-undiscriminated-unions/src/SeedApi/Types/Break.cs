using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using global::System.Xml.Linq;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record Break : IJsonOnDeserialized, IXmlNode
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("strength")]
    public BreakStrength? Strength { get; set; }

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
    /// Child elements that are not part of the typed model. They are written back by ToXml().
    /// </summary>
    [JsonIgnore]
    public List<XmlElement> AdditionalChildren { get; set; } = new();

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
        var result = new Break
        {
            Strength = XmlUtils.ParseValue<BreakStrength?>(
                XmlUtils.GetAttribute(element, "strength")
            ),
            Time = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "time")),
            AdditionalAttributes = XmlUtils.GetAdditionalAttributes(element, "strength", "time"),
            AdditionalChildren = XmlUtils.GetAdditionalChildren(element, new string[] { }),
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
        XmlUtils.AddAdditional(element, AdditionalAttributes, AdditionalChildren);
        return element;
    }

    /// <summary>
    /// Serializes this value to an XML string.
    /// </summary>
    public string ToXml() => XmlUtils.Serialize(ToXElement());

    /// <summary>
    /// Adds an arbitrary child element (for elements not covered by the typed model) and returns this instance for chaining.
    /// </summary>
    public Break AddChild(XmlElement child)
    {
        AdditionalChildren.Add(child);
        return this;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
