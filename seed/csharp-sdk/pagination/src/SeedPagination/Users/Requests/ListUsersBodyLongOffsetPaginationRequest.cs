using System.Text.Json.Serialization;
using SeedPagination.Core;

#nullable enable

namespace SeedPagination;

public record ListUsersBodyLongOffsetPaginationRequest
{
    /// <summary>
    /// The object that contains the offset used for pagination
    /// in order to fetch the next page of results.
    /// </summary>
    [JsonPropertyName("pagination")]
    public WithLongPage? Pagination { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
