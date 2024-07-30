using System.Text.Json.Serialization;
using SeedResponseProperty;

#nullable enable

namespace SeedResponseProperty;

public record Response
{
    [JsonPropertyName("data")]
    public required Movie Data { get; set; }

    [JsonPropertyName("metadata")]
    public Dictionary<string, string> Metadata { get; set; } = new Dictionary<string, string>();

    [JsonPropertyName("docs")]
    public required string Docs { get; set; }
}
