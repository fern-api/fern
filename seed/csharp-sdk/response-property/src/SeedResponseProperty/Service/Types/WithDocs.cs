using System.Text.Json.Serialization;

#nullable enable

namespace SeedResponseProperty;

public record WithDocs
{
    [JsonPropertyName("docs")]
    public required string Docs { get; set; }
}
