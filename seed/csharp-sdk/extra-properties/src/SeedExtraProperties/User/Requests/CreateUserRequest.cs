using System.Text.Json.Serialization;

#nullable enable

namespace SeedExtraProperties;

public class CreateUserRequest
{
    [JsonPropertyName("_type")]
    public string Type { get; init; }

    [JsonPropertyName("_version")]
    public string Version { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; }
}
