using System.Text.Json.Serialization;
using SeedQueryParameters;

#nullable enable

namespace SeedQueryParameters;

public record NestedUser
{
    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("user")]
    public required User User { get; init; }
}
