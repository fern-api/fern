using System.Text.Json.Serialization;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

[Serializable]
public record SearchResourcesRequest
{
    /// <summary>
    /// Maximum results to return
    /// </summary>
    [JsonIgnore]
    public required int Limit { get; set; }

    /// <summary>
    /// Offset for pagination
    /// </summary>
    [JsonIgnore]
    public required int Offset { get; set; }

    /// <summary>
    /// Search query text
    /// </summary>
    [Optional]
    [JsonPropertyName("query")]
    public string? Query { get; set; }

    [Optional]
    [JsonPropertyName("filters")]
    public Dictionary<string, object?>? Filters { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
