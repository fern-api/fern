using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record DoublyLinkedListValue
{
    [JsonPropertyName("head")]
    public string? Head { get; }

    [JsonPropertyName("nodes")]
    public Dictionary<string, DoublyLinkedListNodeValue> Nodes { get; } =
        new Dictionary<string, DoublyLinkedListNodeValue>();
}
