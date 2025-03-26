using System.Text.Json;
using System.Text.Json.Serialization;
using OneOf;
using SeedPagination.Core;

namespace SeedPagination;

public record SearchRequest
{
    [JsonPropertyName("pagination")]
    public StartingAfterPaging? Pagination { get; set; }

    [JsonPropertyName("query")]
    public required OneOf<
        SingleFilterSearchRequest,
        MultipleFilterSearchRequest
    > Query { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
