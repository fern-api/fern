using System.Text.Json.Serialization;

#nullable enable

namespace SeedExtends;

public record Inlined
{
    [JsonPropertyName("unique")]
    public required string Unique { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("docs")]
    public required string Docs { get; set; }
}
