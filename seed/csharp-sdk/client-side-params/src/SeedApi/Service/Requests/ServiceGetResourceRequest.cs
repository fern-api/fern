using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record ServiceGetResourceRequest
{
    [JsonIgnore]
    public required string ResourceId { get; set; }

    /// <summary>
    /// Include metadata in response
    /// </summary>
    [JsonIgnore]
    public required bool IncludeMetadata { get; set; }

    /// <summary>
    /// Response format
    /// </summary>
    [JsonIgnore]
    public required string Format { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
