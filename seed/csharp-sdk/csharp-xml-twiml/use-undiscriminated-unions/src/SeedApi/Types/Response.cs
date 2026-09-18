using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using global::System.Xml.Linq;
using SeedApi.Core;

namespace SeedApi;

/// <summary>
/// Root TwiML element.
/// </summary>
[Serializable]
public record Response : IJsonOnDeserialized, IXmlNode
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("children")]
    public IEnumerable<ResponseChildrenItem>? Children { get; set; }

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

    private static ResponseChildrenItem ParseChildrenItem(XElement child)
    {
        switch (child.Name.LocalName)
        {
            case "Say":
                return global::SeedApi.Say.FromXElement(child);
            case "Dial":
                return global::SeedApi.Dial.FromXElement(child);
            case "Pause":
                return global::SeedApi.Pause.FromXElement(child);
            case "Hangup":
                return global::SeedApi.Hangup.FromXElement(child);
            default:
                throw XmlUtils.UnexpectedElement(child);
        }
    }

    /// <summary>
    /// Parses a <c>&lt;Response&gt;</c> XML document. Throws <see cref="ArgumentException"/> if the XML is malformed or the root element does not match.
    /// </summary>
    public static Response FromXml(string xml) => FromXElement(XmlUtils.ParseRoot(xml, "Response"));

    /// <summary>
    /// Reads this value from an already-parsed XML element.
    /// </summary>
    public static Response FromXElement(XElement element)
    {
        XmlUtils.RequireName(element, "Response");
        var result = new Response
        {
            Children = XmlUtils.ParseChildren(
                element,
                new string[] { "Say", "Dial", "Pause", "Hangup" },
                ParseChildrenItem
            ),
            AdditionalAttributes = XmlUtils.GetAdditionalAttributes(element),
            AdditionalChildren = XmlUtils.GetAdditionalChildren(
                element,
                new string[] { "Say", "Dial", "Pause", "Hangup" }
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
        var element = XmlUtils.CreateElement("Response", null, null);
        if (Children != null)
        {
            foreach (var item in Children)
            {
                element.Add(global::SeedApi.Core.XmlUtils.ToXElement(item.Value));
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
    /// Adds a <c>&lt;Say&gt;</c> child element and returns this instance for chaining.
    /// </summary>
    public Response Say(Say say)
    {
        Children = XmlUtils.Append<ResponseChildrenItem>(Children, say);
        return this;
    }

    /// <summary>
    /// Adds a <c>&lt;Say&gt;</c> child element built from the given values and returns this instance for chaining.
    /// </summary>
    public Response Say(string? message = null, string? voice = null, int? loop = null)
    {
        return Say(
            new global::SeedApi.Say
            {
                Message = message,
                Voice = voice,
                Loop = loop,
            }
        );
    }

    /// <summary>
    /// Adds a <c>&lt;Dial&gt;</c> child element and returns this instance for chaining.
    /// </summary>
    public Response Dial(Dial dial)
    {
        Children = XmlUtils.Append<ResponseChildrenItem>(Children, dial);
        return this;
    }

    /// <summary>
    /// Adds a <c>&lt;Dial&gt;</c> child element built from the given values and returns this instance for chaining.
    /// </summary>
    public Response Dial(
        string? number = null,
        IEnumerable<string>? statusCallbackEvent = null,
        IEnumerable<DialRecordItem>? record_ = null
    )
    {
        return Dial(
            new global::SeedApi.Dial
            {
                Number = number,
                StatusCallbackEvent = statusCallbackEvent,
                Record = record_,
            }
        );
    }

    /// <summary>
    /// Adds a <c>&lt;Pause&gt;</c> child element and returns this instance for chaining.
    /// </summary>
    public Response Pause(Pause pause)
    {
        Children = XmlUtils.Append<ResponseChildrenItem>(Children, pause);
        return this;
    }

    /// <summary>
    /// Adds a <c>&lt;Pause&gt;</c> child element built from the given values and returns this instance for chaining.
    /// </summary>
    public Response Pause(int? length = null)
    {
        return Pause(new global::SeedApi.Pause { Length = length });
    }

    /// <summary>
    /// Adds a <c>&lt;Hangup&gt;</c> child element and returns this instance for chaining.
    /// </summary>
    public Response Hangup(Hangup hangup)
    {
        Children = XmlUtils.Append<ResponseChildrenItem>(Children, hangup);
        return this;
    }

    /// <summary>
    /// Adds a <c>&lt;Hangup&gt;</c> child element built from the given values and returns this instance for chaining.
    /// </summary>
    public Response Hangup()
    {
        return Hangup(new global::SeedApi.Hangup());
    }

    /// <summary>
    /// Adds an arbitrary child element (for elements not covered by the typed model) and returns this instance for chaining.
    /// </summary>
    public Response AddChild(XmlElement child)
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
