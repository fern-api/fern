using System.Text.Json.Serialization;

#nullable enable

namespace SeedResponseProperty;

public record WithMetadata
{
    [JsonPropertyName("metadata")]
    public Dictionary<string, string> Metadata { get; set; } = new Dictionary<string, string>();
}
