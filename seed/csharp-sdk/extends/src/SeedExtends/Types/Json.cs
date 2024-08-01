using System.Text.Json.Serialization;

#nullable enable

namespace SeedExtends;

public record Json
{
    [JsonPropertyName("raw")]
    public required string Raw { get; set; }

    [JsonPropertyName("docs")]
    public required string Docs { get; set; }
}
