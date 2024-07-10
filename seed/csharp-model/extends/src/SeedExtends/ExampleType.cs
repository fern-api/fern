using System.Text.Json.Serialization;

#nullable enable

namespace SeedExtends;

public record ExampleType
{
    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("docs")]
    public required string Docs { get; init; }
}
