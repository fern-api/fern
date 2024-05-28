using System.Text.Json.Serialization;

#nullable enable

namespace SeedResponseProperty;

public class WithMetadata
{
    [JsonPropertyName("metadata")]
    public Dictionary<string, string> Metadata { get; init; }
}
