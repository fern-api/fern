using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedCsharpXmlEntities.Core;

namespace SeedCsharpXmlEntities;

/// <summary>
/// Model demonstrating HTML entity bug in C# XML documentation.
/// This description contains HTML entities that are not valid in XML.
/// </summary>
[Serializable]
public record TimeZoneModel : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// Format is UTC + offset notation (e.g., +05:30)
    /// </summary>
    [JsonPropertyName("timeZoneOffset")]
    public required string TimeZoneOffset { get; set; }

    /// <summary>
    /// Expression: A + B - C × D ÷ E
    /// </summary>
    [JsonPropertyName("mathExpression")]
    public required string MathExpression { get; set; }

    /// <summary>
    /// This uses valid XML entity: A &lt; B &amp; C &gt; D
    /// </summary>
    [JsonPropertyName("validEntity")]
    public required string ValidEntity { get; set; }

    /// <summary>
    /// Special characters:   … · ©
    /// </summary>
    [JsonPropertyName("specialChars")]
    public string? SpecialChars { get; set; }

    /// <summary>
    /// See <see href="https://example.com/docs?a=1&amp;b=2">see here</see> for details
    /// </summary>
    [JsonPropertyName("documentationLink")]
    public string? DocumentationLink { get; set; }

    /// <summary>
    /// See <see href="https://example.com/docs?a=1&amp;b=2">see here</see> for details
    /// </summary>
    [JsonPropertyName("escapedDocumentationLink")]
    public string? EscapedDocumentationLink { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
