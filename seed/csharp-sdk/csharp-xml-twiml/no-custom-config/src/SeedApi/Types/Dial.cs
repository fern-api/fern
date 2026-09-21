using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using global::System.Xml.Linq;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record Dial : IJsonOnDeserialized, IXmlNode
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("number")]
    public string? Number { get; set; }

    [JsonPropertyName("status_callback_event")]
    public IEnumerable<string>? StatusCallbackEvent { get; set; }

    [JsonPropertyName("record")]
    public IEnumerable<DialRecordItem>? Record { get; set; }

    [JsonPropertyName("numbers")]
    public IEnumerable<Number>? Numbers { get; set; }

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
    /// Parses a <c>&lt;Dial&gt;</c> XML document. Throws <see cref="ArgumentException"/> if the XML is malformed or the root element does not match.
    /// </summary>
    public static Dial FromXml(string xml) => FromXElement(XmlUtils.ParseRoot(xml, "Dial"));

    /// <summary>
    /// Reads this value from an already-parsed XML element.
    /// </summary>
    public static Dial FromXElement(XElement element)
    {
        XmlUtils.RequireName(element, "Dial");
        var result = new Dial
        {
            Number = XmlUtils.ParseValue<string?>(XmlUtils.GetText(element)),
            StatusCallbackEvent = XmlUtils.ParseList<string>(
                XmlUtils.GetAttribute(element, "statusCallbackEvent"),
                " "
            ),
            Record = XmlUtils.ParseList<DialRecordItem>(
                XmlUtils.GetAttribute(element, "record"),
                " "
            ),
            Numbers = XmlUtils.ParseChildren(
                XmlUtils.GetWrapper(element, "Numbers"),
                new string[] { "Number" },
                global::SeedApi.Number.FromXElement
            ),
            AdditionalAttributes = XmlUtils.GetAdditionalAttributes(
                element,
                "statusCallbackEvent",
                "record"
            ),
            AdditionalChildren = XmlUtils.GetAdditionalChildren(
                element,
                new string[] { },
                new Dictionary<string, string[]> { { "Numbers", new string[] { "Number" } } }
            ),
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
        var element = XmlUtils.CreateElement("Dial", "https://www.twilio.com/twiml", "tw");
        XmlUtils.SetText(element, XmlUtils.ToXmlString(Number));
        XmlUtils.SetAttribute(
            element,
            "statusCallbackEvent",
            XmlUtils.JoinValues(StatusCallbackEvent, " ")
        );
        XmlUtils.SetAttribute(element, "record", XmlUtils.JoinValues(Record, " "));
        if (Numbers != null)
        {
            var wrapper = XmlUtils.AddWrapper(element, "Numbers");
            foreach (var item in Numbers)
            {
                wrapper.Add(item.ToXElement());
            }
        }
        XmlUtils.AddAdditional(element, AdditionalAttributes, AdditionalChildren, "Numbers");
        return element;
    }

    /// <summary>
    /// Serializes this value to an XML string.
    /// </summary>
    public string ToXml() => XmlUtils.Serialize(ToXElement());

    /// <summary>
    /// Adds a <c>&lt;Number&gt;</c> child element and returns this instance for chaining.
    /// </summary>
    public Dial AddNumber(Number number)
    {
        Numbers = XmlUtils.Append<Number>(Numbers, number);
        return this;
    }

    /// <summary>
    /// Adds a <c>&lt;Number&gt;</c> child element built from the given values and returns this instance for chaining.
    /// </summary>
    public Dial AddNumber(string? phoneNumber = null, string? sendDigits = null)
    {
        return AddNumber(
            new global::SeedApi.Number { PhoneNumber = phoneNumber, SendDigits = sendDigits }
        );
    }

    /// <summary>
    /// Adds an arbitrary child element (for elements not covered by the typed model) and returns this instance for chaining.
    /// </summary>
    public Dial AddChild(XmlElement child)
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
