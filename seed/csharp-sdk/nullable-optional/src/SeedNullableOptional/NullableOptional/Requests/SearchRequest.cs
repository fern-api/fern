using System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

[Serializable]
public record SearchRequest
{
    [JsonPropertyName("query")]
    public required string Query { get; set; }

    [Optional]
    [JsonPropertyName("filters")]
    public Dictionary<string, string?>? Filters { get; set; }

    [Nullable]
    [JsonPropertyName("includeTypes")]
    public IEnumerable<string>? IncludeTypes { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
