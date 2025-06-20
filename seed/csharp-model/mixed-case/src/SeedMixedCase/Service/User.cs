using System.Text.Json;
using System.Text.Json.Serialization;
using SeedMixedCase.Core;

namespace SeedMixedCase;

[Serializable]
public record User
{
    [JsonPropertyName("userName")]
    public required string UserName { get; set; }

    [JsonPropertyName("metadata_tags")]
    public IEnumerable<string> MetadataTags { get; set; } = new List<string>();

    [JsonPropertyName("EXTRA_PROPERTIES")]
    public Dictionary<string, string> ExtraProperties { get; set; } =
        new Dictionary<string, string>();

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
