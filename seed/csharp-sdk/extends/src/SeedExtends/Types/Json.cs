using System.Text.Json.Serialization;

#nullable enable

namespace SeedExtends;

public record Json
{
    [JsonPropertyName("raw")]
    public required string Raw { get; }

    [JsonPropertyName("docs")]
    public required string Docs { get; }
}
