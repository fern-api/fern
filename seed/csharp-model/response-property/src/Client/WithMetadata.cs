using System.Text.Json.Serialization;

namespace Client;

public class WithMetadata
{
    [JsonPropertyName("metadata")]
    public Dictionary<string, string> Metadata { get; init; }
}
