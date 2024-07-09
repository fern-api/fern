using System.Text.Json.Serialization;

#nullable enable

namespace SeedExtraProperties;

public record CreateUserRequest
{
    [JsonPropertyName("_type")]
    public required string Type { get; init; }

    [JsonPropertyName("_version")]
    public required string Version { get; init; }

    [JsonPropertyName("name")]
    public required string Name { get; init; }
}
