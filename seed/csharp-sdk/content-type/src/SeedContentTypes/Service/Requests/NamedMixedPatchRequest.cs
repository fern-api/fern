using System.Text.Json.Serialization;
using SeedContentTypes.Core;

namespace SeedContentTypes;

[Serializable]
public record NamedMixedPatchRequest
{
    [Optional]
    [JsonPropertyName("appId")]
    public string? AppId { get; set; }

    [Nullable]
    [JsonPropertyName("instructions")]
    public string? Instructions { get; set; }

    [Nullable]
    [JsonPropertyName("active")]
    public bool? Active { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
