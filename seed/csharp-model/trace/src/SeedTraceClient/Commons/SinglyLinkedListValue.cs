using System.Text.Json.Serialization
using SeedTraceClient

namespace SeedTraceClient

public class SinglyLinkedListValue
{
    [JsonPropertyName("head")]
    public string? Head { get; init; }

    [JsonPropertyName("nodes")]
    public Dictionary<string, SinglyLinkedListNodeValue> Nodes { get; init; }
}
