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
    public required int TotalCount { get; init; }

    [JsonPropertyName("data")]
    public required UserListContainer Data { get; init; }

    [JsonPropertyName("next")]
    public string? Next { get; init; }
}
