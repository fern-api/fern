using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record ListUsersPaginationResponse
{
    [JsonPropertyName("hasNextPage")]
    public bool? HasNextPage { get; set; }

    [JsonPropertyName("page")]
    public Page? Page { get; set; }

    /// <summary>
    /// The totall number of /users
    /// </summary>
    [JsonPropertyName("total_count")]
    public required int TotalCount { get; set; }

    [JsonPropertyName("data")]
    public IEnumerable<User> Data { get; set; } = new List<User>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
