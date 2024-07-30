using System.Text.Json.Serialization;

#nullable enable

namespace SeedExtends;

public record ExampleType
{
    [JsonPropertyName("name")]
    public required string Name { get; }

    [JsonPropertyName("docs")]
    public required string Docs { get; }
}
