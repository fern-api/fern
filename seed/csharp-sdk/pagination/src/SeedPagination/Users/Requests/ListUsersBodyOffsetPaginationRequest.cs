using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record ListUsersBodyOffsetPaginationRequest
{
    /// <summary>
    /// The object that contains the offset used for pagination
    /// in order to fetch the next page of results.
    /// </summary>
    [JsonPropertyName("pagination")]
    public WithPage? Pagination { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
