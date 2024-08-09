using System.Text.Json.Serialization;

#nullable enable

namespace SeedExtraProperties;

public record CreateUserRequest
{
    [JsonPropertyName("_type")]
    public required string Type { get; set; }

    [JsonPropertyName("_version")]
    public required string Version { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }
}
