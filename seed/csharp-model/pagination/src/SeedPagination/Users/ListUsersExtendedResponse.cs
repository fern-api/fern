using System.Text.Json.Serialization;
using SeedPagination;

#nullable enable

namespace SeedPagination;

public class ListUsersExtendedResponse
{
    /// <summary>
    /// The totall number of /users
    /// </summary>
    [JsonPropertyName("total_count")]
    public int TotalCount { get; init; }

    [JsonPropertyName("data")]
    public UserListContainer Data { get; init; }

    [JsonPropertyName("next")]
    public Guid? Next { get; init; }
}
