using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record SinglyLinkedListValue
{
    [JsonPropertyName("head")]
    public string? Head { get; }

    [JsonPropertyName("nodes")]
    public Dictionary<string, SinglyLinkedListNodeValue> Nodes { get; } =
        new Dictionary<string, SinglyLinkedListNodeValue>();
}
