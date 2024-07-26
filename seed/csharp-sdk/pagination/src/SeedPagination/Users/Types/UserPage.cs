using System.Text.Json.Serialization;
using SeedPagination;

#nullable enable

namespace SeedPagination;

public record UserPage
{
    [JsonPropertyName("data")]
    public required UserListContainer Data { get; init; }

    [JsonPropertyName("next")]
    public string? Next { get; init; }
}
