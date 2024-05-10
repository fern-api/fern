using System.Text.Json.Serialization;
using SeedPagination;

namespace SeedPagination;

public class ListUsersPaginationResponse
{
    [JsonPropertyName("page")]
    public Page? Page { get; init; }

    /// <summary>
    /// The totall number of /users
    /// </summary>
    [JsonPropertyName("total_count")]
    public int TotalCount { get; init; }

    [JsonPropertyName("data")]
    public List<User> Data { get; init; }
}
