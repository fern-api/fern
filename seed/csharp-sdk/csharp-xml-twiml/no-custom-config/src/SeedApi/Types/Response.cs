using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using global::System.Xml.Linq;
using OneOf;
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
    public IEnumerable<OneOf<Say, Dial, Pause, Hangup>>? Children { get; set; }

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

    private static bool IsChildrenItem(object item) =>
        item is global::SeedApi.Say
        || item is global::SeedApi.Dial
        || item is global::SeedApi.Pause
        || item is global::SeedApi.Hangup;

    private static OneOf<Say, Dial, Pause, Hangup> ToChildrenItem(object item)
    {
        switch (item)
        {
            case global::SeedApi.Say value:
                return value;
            case global::SeedApi.Dial value:
                return value;
            case global::SeedApi.Pause value:
                return value;
            case global::SeedApi.Hangup value:
                return value;
            default:
                throw new ArgumentException(
                    $"Unexpected content item of type {item.GetType().Name}"
                );
        }
    }

    private static object? ParseContentChild(XElement child)
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
                return null;
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
        var content = XmlUtils.ReadContent(element, ParseContentChild, false, null, null);
        var result = new Response
        {
            Children = XmlUtils.ContentItems(content, IsChildrenItem, ToChildrenItem),
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
        var element = XmlUtils.CreateElement("Response", null, null);
        XmlUtils.AddContent(
            element,
            XmlUtils.OrderContent(Content, Children?.Select(item => item.Value))
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
    /// Hash code derived from the rendered XML, consistent with Equals.
    /// </summary>
    public override int GetHashCode() => XmlUtils.XmlHashCode(this);

    /// <summary>
    /// Adds a <c>&lt;Say&gt;</c> child element after any content added so far and returns this instance for chaining.
    /// <para>
    /// &lt;Say&gt; TwiML Verb
    /// </para>
    /// </summary>
    /// <param name="say">The <c>&lt;Say&gt;</c> element to add.</param>
    public Response Say(Say say)
    {
        Children = XmlUtils.Append<OneOf<Say, Dial, Pause, Hangup>>(Children, say);
        Content.Add(say);
        return this;
    }

    /// <summary>
    /// Adds a <c>&lt;Say&gt;</c> child element built from the given values and returns this instance for chaining.
    /// <para>
    /// &lt;Say&gt; TwiML Verb
    /// </para>
    /// </summary>
    /// <param name="message">Message to say</param>
    /// <param name="voice">Voice to use</param>
    /// <param name="loop">Times to loop message</param>
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
    /// Adds a <c>&lt;Dial&gt;</c> child element after any content added so far and returns this instance for chaining.
    /// </summary>
    /// <param name="dial">The <c>&lt;Dial&gt;</c> element to add.</param>
    public Response Dial(Dial dial)
    {
        Children = XmlUtils.Append<OneOf<Say, Dial, Pause, Hangup>>(Children, dial);
        Content.Add(dial);
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
    /// Adds a <c>&lt;Pause&gt;</c> child element after any content added so far and returns this instance for chaining.
    /// <para>
    /// XML element without an explicit xml.name; falls back to the schema name.
    /// </para>
    /// </summary>
    /// <param name="pause">The <c>&lt;Pause&gt;</c> element to add.</param>
    public Response Pause(Pause pause)
    {
        Children = XmlUtils.Append<OneOf<Say, Dial, Pause, Hangup>>(Children, pause);
        Content.Add(pause);
        return this;
    }

    /// <summary>
    /// Adds a <c>&lt;Pause&gt;</c> child element built from the given values and returns this instance for chaining.
    /// <para>
    /// XML element without an explicit xml.name; falls back to the schema name.
    /// </para>
    /// </summary>
    public Response Pause(int? length = null)
    {
        return Pause(new global::SeedApi.Pause { Length = length });
    }

    /// <summary>
    /// Adds a <c>&lt;Hangup&gt;</c> child element after any content added so far and returns this instance for chaining.
    /// </summary>
    /// <param name="hangup">The <c>&lt;Hangup&gt;</c> element to add.</param>
    public Response Hangup(Hangup hangup)
    {
        Children = XmlUtils.Append<OneOf<Say, Dial, Pause, Hangup>>(Children, hangup);
        Content.Add(hangup);
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
    /// Adds an arbitrary child element (for elements not covered by the typed model) after any content added so far and returns this instance for chaining.
    /// </summary>
    public Response AddChild(XmlElement child)
    {
        Content.Add(child);
        return this;
    }

    /// <summary>
    /// Appends a text segment after any content added so far, so text can be interleaved with child elements, and returns this instance for chaining.
    /// </summary>
    public Response AddText(string text)
    {
        Content.Add(text);
        return this;
    }

    /// <summary>
    /// Two values are equal when they render to the same XML.
    /// </summary>
    public virtual bool Equals(Response? other) => XmlUtils.XmlEquals(this, other);

    /// <summary>
    /// Returns the XML representation of this value.
    /// </summary>
    public override string ToString() => ToXml();
}
