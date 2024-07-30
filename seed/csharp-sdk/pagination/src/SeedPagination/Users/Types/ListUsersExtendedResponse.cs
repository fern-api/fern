using System.Text.Json.Serialization;
using SeedPagination;

#nullable enable

namespace SeedPagination;

public record ListUsersExtendedResponse
{
    /// <summary>
    /// The totall number of /users
    /// </summary>
    [JsonPropertyName("total_count")]
    public required int TotalCount { get; }

    [JsonPropertyName("data")]
    public required UserListContainer Data { get; }

    [JsonPropertyName("next")]
    public string? Next { get; }
}
