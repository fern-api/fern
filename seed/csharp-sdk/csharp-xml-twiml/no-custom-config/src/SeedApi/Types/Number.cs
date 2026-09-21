using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using global::System.Xml.Linq;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record Number : IJsonOnDeserialized, IXmlNode
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("phone_number")]
    public string? PhoneNumber { get; set; }

    [JsonPropertyName("send_digits")]
    public string? SendDigits { get; set; }

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
    /// Parses a <c>&lt;Number&gt;</c> XML document. Throws <see cref="ArgumentException"/> if the XML is malformed or the root element does not match.
    /// </summary>
    public static Number FromXml(string xml) => FromXElement(XmlUtils.ParseRoot(xml, "Number"));

    /// <summary>
    /// Reads this value from an already-parsed XML element.
    /// </summary>
    public static Number FromXElement(XElement element)
    {
        XmlUtils.RequireName(element, "Number");
        var result = new Number
        {
            PhoneNumber = XmlUtils.ParseValue<string?>(XmlUtils.GetText(element)),
            SendDigits = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "sendDigits")),
            AdditionalAttributes = XmlUtils.GetAdditionalAttributes(element, "sendDigits"),
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
        var element = XmlUtils.CreateElement("Number", null, null);
        XmlUtils.SetText(element, XmlUtils.ToXmlString(PhoneNumber));
        XmlUtils.SetAttribute(element, "sendDigits", XmlUtils.ToXmlString(SendDigits));
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
    public Number AddChild(XmlElement child)
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
