using System.Text.Json.Serialization
using SeedTraceClient

namespace SeedTraceClient

public class DoublyLinkedListValue
{
    [JsonPropertyName("head")]
    public string? Head { get; init; }
    [JsonPropertyName("nodes")]
    public Dictionary<string,DoublyLinkedListNodeValue> Nodes { get; init; }
}
