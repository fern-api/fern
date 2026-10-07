using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using global::System.Xml.Linq;
using SeedApi.Core;

namespace SeedApi;

/// <summary>
/// &lt;Say&gt; TwiML Verb
/// </summary>
[Serializable]
public record Say : IJsonOnDeserialized, IXmlNode
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// Message to say
    /// </summary>
    [JsonPropertyName("message")]
    public string? Message { get; set; }

    /// <summary>
    /// Voice to use
    /// </summary>
    [JsonPropertyName("voice")]
    public string? Voice { get; set; }

    /// <summary>
    /// Times to loop message
    /// </summary>
    [JsonPropertyName("loop")]
    public int? Loop { get; set; }

    /// <summary>
    /// Nested TwiML elements, rendered in order.
    /// </summary>
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
    /// Ordered content of the element: text segments (string), comments (XmlComment), typed child elements and child elements that are not part of the typed model (XmlElement), in the order they are written. Typed children assigned directly to their property are appended after it.
    /// </summary>
    [JsonIgnore]
    public List<object> Content { get; set; } = new();

    /// <summary>
    /// Child elements that are not part of the typed model, derived from Content (a snapshot; add children through AddChild or Content).
    /// </summary>
    [JsonIgnore]
    public IReadOnlyList<XmlElement> AdditionalChildren => Content.OfType<XmlElement>().ToList();

    private static object? ParseContentChild(XElement child)
    {
        switch (child.Name.LocalName)
        {
            case "break":
                return global::SeedApi.Break.FromXElement(child);
            default:
                return null;
        }
    }

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
        var content = XmlUtils.ReadContent(element, ParseContentChild, true, null, null);
        var result = new Say
        {
            Message = XmlUtils.ParseValue<string?>(XmlUtils.GetLeadingText(element)),
            Voice = XmlUtils.ParseValue<string?>(XmlUtils.GetAttribute(element, "voice")),
            Loop = XmlUtils.ParseValue<int?>(XmlUtils.GetAttribute(element, "loop")),
            Children = XmlUtils.ContentItems<Break>(content),
            AdditionalAttributes = XmlUtils.GetAdditionalAttributes(element, "voice", "loop"),
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
        var element = XmlUtils.CreateElement("Say", null, null);
        XmlUtils.SetText(element, XmlUtils.ToXmlString(Message));
        XmlUtils.SetAttribute(element, "voice", XmlUtils.ToXmlString(Voice));
        XmlUtils.SetAttribute(element, "loop", XmlUtils.ToXmlString(Loop));
        XmlUtils.AddContent(element, XmlUtils.OrderContent(Content, Children));
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
    /// Adds a <c>&lt;break&gt;</c> child element after any content added so far and returns this instance for chaining.
    /// <para>
    /// Adding a Pause in &lt;Say&gt;
    /// </para>
    /// </summary>
    /// <param name="break_">The <c>&lt;break&gt;</c> element to add.</param>
    public Say Break(Break break_)
    {
        Children = XmlUtils.Append<Break>(Children, break_);
        Content.Add(break_);
        return this;
    }

    /// <summary>
    /// Adds a <c>&lt;break&gt;</c> child element built from the given values and returns this instance for chaining.
    /// <para>
    /// Adding a Pause in &lt;Say&gt;
    /// </para>
    /// </summary>
    /// <param name="strength">Set a pause based on strength</param>
    /// <param name="time">Set a pause to a specific length of time in seconds or milliseconds, available values: [number]s, [number]ms</param>
    public Say Break(BreakStrength? strength = null, string? time = null)
    {
        return Break(new global::SeedApi.Break { Strength = strength, Time = time });
    }

    /// <summary>
    /// Adds an arbitrary child element (for elements not covered by the typed model) after any content added so far and returns this instance for chaining.
    /// </summary>
    public Say AddChild(XmlElement child)
    {
        Content.Add(child);
        return this;
    }

    /// <summary>
    /// Appends a text segment after any content added so far, so text can be interleaved with child elements, and returns this instance for chaining.
    /// </summary>
    public Say AddText(string text)
    {
        Content.Add(text);
        return this;
    }

    /// <summary>
    /// Appends an XML comment (&lt;!--text--&gt;) inside this element after any content added so far and returns this instance for chaining.
    /// </summary>
    public Say Comment(string text)
    {
        Content.Add(new XmlComment(text));
        return this;
    }

    /// <summary>
    /// Adds an XML comment rendered immediately before this element (as a sibling in its parent, or before the root element) and returns this instance for chaining.
    /// </summary>
    public Say CommentBefore(string text)
    {
        Content.Add(XmlComment.Before(text));
        return this;
    }

    /// <summary>
    /// Adds an XML comment rendered immediately after this element (as a sibling in its parent, or after the root element) and returns this instance for chaining.
    /// </summary>
    public Say CommentAfter(string text)
    {
        Content.Add(XmlComment.After(text));
        return this;
    }

    /// <summary>
    /// Two values are equal when they render to the same XML.
    /// </summary>
    public virtual bool Equals(Say? other) => XmlUtils.XmlEquals(this, other);

    /// <summary>
    /// Returns the XML representation of this value.
    /// </summary>
    public override string ToString() => ToXml();
}
