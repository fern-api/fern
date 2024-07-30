using System.Text.Json.Serialization;
using SeedPagination;

#nullable enable

namespace SeedPagination;

public record ListUsersBodyCursorPaginationRequest
{
    /// <summary>
    /// The object that contains the cursor used for pagination
    /// in order to fetch the next page of results.
    ///
    /// </summary>
    [JsonPropertyName("pagination")]
    public WithCursor? Pagination { get; set; }
}
