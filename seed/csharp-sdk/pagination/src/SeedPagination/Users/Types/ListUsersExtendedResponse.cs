using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record ListUsersExtendedResponse
{
    /// <summary>
    /// The totall number of /users
    /// </summary>
    [JsonPropertyName("total_count")]
    public required int TotalCount { get; set; }

    [JsonPropertyName("data")]
    public required UserListContainer Data { get; set; }

    [JsonPropertyName("next")]
    public string? Next { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
