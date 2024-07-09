using System.Text.Json.Serialization;
using SeedPagination;

#nullable enable

namespace SeedPagination;

public record ListUsersPaginationResponse
{
    [JsonPropertyName("page")]
    public Page? Page { get; init; }

    /// <summary>
    /// The totall number of /users
    /// </summary>
    [JsonPropertyName("total_count")]
    public required int TotalCount { get; init; }

    [JsonPropertyName("data")]
    public IEnumerable<User> Data { get; init; } = new List<User>();
}
