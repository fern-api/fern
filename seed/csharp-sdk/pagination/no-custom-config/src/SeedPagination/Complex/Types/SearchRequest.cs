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

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
