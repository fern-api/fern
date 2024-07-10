using System.Text.Json.Serialization;

#nullable enable

namespace SeedExtends;

public record NestedType
{
    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("raw")]
    public required string Raw { get; init; }

    [JsonPropertyName("docs")]
    public required string Docs { get; init; }
}
