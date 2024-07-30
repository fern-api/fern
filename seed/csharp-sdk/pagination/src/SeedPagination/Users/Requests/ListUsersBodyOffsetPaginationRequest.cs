using System.Text.Json.Serialization;
using SeedPagination;

#nullable enable

namespace SeedPagination;

public record ListUsersBodyOffsetPaginationRequest
{
    /// <summary>
    /// The object that contains the offset used for pagination
    /// in order to fetch the next page of results.
    ///
    /// </summary>
    [JsonPropertyName("pagination")]
    public WithPage? Pagination { get; set; }
}
