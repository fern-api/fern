using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class DoublyLinkedListValue
{
    [JsonPropertyName("head")]
    public List<string?> Head { get; init; }

    [JsonPropertyName("nodes")]
    public List<Dictionary<string, DoublyLinkedListNodeValue>> Nodes { get; init; }
}
