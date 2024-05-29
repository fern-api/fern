using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class SinglyLinkedListValue
{
    [JsonPropertyName("head")]
    public string? Head { get; init; }

    [JsonPropertyName("nodes")]
    public Dictionary<string, SinglyLinkedListNodeValue> Nodes { get; init; }
}
