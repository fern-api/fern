using System.Text.Json.Serialization;
using SeedPagination;

#nullable enable

namespace SeedPagination;

public class UserPage
{
    [JsonPropertyName("data")]
    public UserListContainer Data { get; init; }

    [JsonPropertyName("next")]
    public Guid? Next { get; init; }
}
