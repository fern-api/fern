using System.Text.Json.Serialization;

#nullable enable

namespace SeedPagination;

public record User
{
    [JsonPropertyName("name")]
    public required string Name { get; }

    [JsonPropertyName("id")]
    public required int Id { get; }
}
