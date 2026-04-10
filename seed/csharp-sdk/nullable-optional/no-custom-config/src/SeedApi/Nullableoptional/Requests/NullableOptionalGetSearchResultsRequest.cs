using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record NullableOptionalGetSearchResultsRequest
{
    [JsonPropertyName("query")]
    public required string Query { get; set; }

    [JsonPropertyName("filters")]
    public Dictionary<string, string?>? Filters { get; set; }

    [JsonPropertyName("includeTypes")]
    public IEnumerable<string>? IncludeTypes { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
