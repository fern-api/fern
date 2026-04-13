using global::System.Text.Json.Serialization;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record SearchRequest
{
    [JsonIgnore]
    public required string Index { get; set; }

    [JsonPropertyName("pagination")]
    public StartingAfterPaging? Pagination { get; set; }

    [JsonPropertyName("query")]
    public required OneOf<
        SingleFilterSearchRequest,
        MultipleFilterSearchRequest
    > Query { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
