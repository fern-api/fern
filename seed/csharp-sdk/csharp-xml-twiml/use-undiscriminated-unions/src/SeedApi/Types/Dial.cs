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
    /// Parses a <c>&lt;Dial&gt;</c> XML document. Throws <see cref="ArgumentException"/> if the XML is malformed or the root element does not match.
    /// </summary>
    public static Dial FromXml(string xml) => FromXElement(XmlUtils.ParseRoot(xml, "Dial"));

    /// <summary>
    /// Reads this value from an already-parsed XML element.
    /// </summary>
    public static Dial FromXElement(XElement element)
    {
        XmlUtils.RequireName(element, "Dial");
        var content = XmlUtils.ReadContent(
            element,
            null,
            true,
            null,
            new Dictionary<string, string[]> { { "Numbers", new string[] { "Number" } } }
        );
        var result = new Dial
        {
            Number = XmlUtils.ParseValue<string?>(XmlUtils.GetLeadingText(element)),
            StatusCallbackEvent = XmlUtils.ParseList<string>(
                XmlUtils.GetAttribute(element, "statusCallbackEvent"),
                " "
            ),
            Record = XmlUtils.ParseList<DialRecordItem>(
                XmlUtils.GetAttribute(element, "record"),
                " "
            ),
            Numbers = XmlUtils.ParseChildren(
                XmlUtils.GetWrapperItems(element, "Numbers"),
                new string[] { "Number" },
                global::SeedApi.Number.FromXElement
            ),
            AdditionalAttributes = XmlUtils.GetAdditionalAttributes(
                element,
                "statusCallbackEvent",
                "record"
            ),
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
        var element = XmlUtils.CreateElement("Dial", "https://www.twilio.com/twiml", "tw");
        XmlUtils.SetText(element, XmlUtils.ToXmlString(Number));
        XmlUtils.SetAttribute(
            element,
            "statusCallbackEvent",
            XmlUtils.JoinValues(StatusCallbackEvent, " ")
        );
        XmlUtils.SetAttribute(element, "record", XmlUtils.JoinValues(Record, " "));
        XmlUtils.AddContent(
            element,
            XmlUtils.OrderContent(Content),
            new Dictionary<string, List<XElement>?>
            {
                { "Numbers", XmlUtils.RenderWrappedItems(Numbers, item => item.ToXElement()) },
            }
        );
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
    /// Adds a <c>&lt;Number&gt;</c> child element after any content added so far and returns this instance for chaining.
    /// </summary>
    /// <param name="number">The <c>&lt;Number&gt;</c> element to add.</param>
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
    /// Adds an arbitrary child element (for elements not covered by the typed model) after any content added so far and returns this instance for chaining.
    /// </summary>
    public Dial AddChild(XmlElement child)
    {
        Content.Add(child);
        return this;
    }

    /// <summary>
    /// Appends a text segment after any content added so far, so text can be interleaved with child elements, and returns this instance for chaining.
    /// </summary>
    public Dial AddText(string text)
    {
        Content.Add(text);
        return this;
    }

    /// <summary>
    /// Appends an XML comment (&lt;!--text--&gt;) inside this element after any content added so far and returns this instance for chaining.
    /// </summary>
    public Dial Comment(string text)
    {
        Content.Add(new XmlComment(text));
        return this;
    }

    /// <summary>
    /// Adds an XML comment rendered immediately before this element (as a sibling in its parent, or before the root element) and returns this instance for chaining.
    /// </summary>
    public Dial CommentBefore(string text)
    {
        Content.Add(XmlComment.Before(text));
        return this;
    }

    /// <summary>
    /// Adds an XML comment rendered immediately after this element (as a sibling in its parent, or after the root element) and returns this instance for chaining.
    /// </summary>
    public Dial CommentAfter(string text)
    {
        Content.Add(XmlComment.After(text));
        return this;
    }

    /// <summary>
    /// Returns the XML representation of this value.
    /// </summary>
    public override string ToString() => ToXml();
}
