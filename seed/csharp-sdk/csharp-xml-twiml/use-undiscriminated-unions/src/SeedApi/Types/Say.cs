using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using global::System.Xml.Linq;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record Say : IJsonOnDeserialized, IXmlNode
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonPropertyName("voice")]
    public string? Voice { get; set; }

    [JsonPropertyName("loop")]
    public int? Loop { get; set; }

    [JsonPropertyName("children")]
    public IEnumerable<Break>? Children { get; set; }

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
    /// Parses a <c>&lt;Say&gt;</c> XML document. Throws <see cref="ArgumentException"/> if the XML is malformed or the root element does not match.
    /// </summary>
    public static Say FromXml(string xml) => FromXElement(XmlUtils.ParseRoot(xml, "Say"));

    /// <summary>
    /// Reads this value from an already-parsed XML element.
    /// </summary>
    public static Say FromXElement(XElement element)
    {
        XmlUtils.RequireName(element, "Say");
        var result = new Say
        {
            Message = XmlUtils.ParseValue<string?>(XmlUtils.GetText(element)),
            Voice = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "voice")),
            Loop = XmlUtils.ParseValue<int?>(XmlUtils.GetAttribute(element, "loop")),
            Children = XmlUtils.ParseChildren(
                element,
                new string[] { "break" },
                global::SeedApi.Break.FromXElement
            ),
            AdditionalAttributes = XmlUtils.GetAdditionalAttributes(element, "voice", "loop"),
            AdditionalChildren = XmlUtils.GetAdditionalChildren(element, new string[] { "break" }),
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
        var element = XmlUtils.CreateElement("Say", null, null);
        XmlUtils.SetText(element, XmlUtils.ToXmlString(Message));
        XmlUtils.SetAttribute(element, "voice", XmlUtils.ToXmlString(Voice));
        XmlUtils.SetAttribute(element, "loop", XmlUtils.ToXmlString(Loop));
        if (Children != null)
        {
            foreach (var item in Children)
            {
                element.Add(item.ToXElement());
            }
        }
        XmlUtils.AddAdditional(element, AdditionalAttributes, AdditionalChildren);
        return element;
    }

    /// <summary>
    /// Serializes this value to an XML string.
    /// </summary>
    public string ToXml() => XmlUtils.Serialize(ToXElement());

    /// <summary>
    /// Adds a <c>&lt;break&gt;</c> child element and returns this instance for chaining.
    /// </summary>
    public Say Break(Break break_)
    {
        Children = XmlUtils.Append<Break>(Children, break_);
        return this;
    }

    /// <summary>
    /// Adds a <c>&lt;break&gt;</c> child element built from the given values and returns this instance for chaining.
    /// </summary>
    public Say Break(BreakStrength? strength = null, string? time = null)
    {
        return Break(new global::SeedApi.Break { Strength = strength, Time = time });
    }

    /// <summary>
    /// Adds an arbitrary child element (for elements not covered by the typed model) and returns this instance for chaining.
    /// </summary>
    public Say AddChild(XmlElement child)
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
