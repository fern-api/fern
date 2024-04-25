using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class SinglyLinkedListValue
{
    [JsonPropertyName("head")]
    public List<string?> Head { get; init; }

    [JsonPropertyName("nodes")]
    public List<Dictionary<string, SinglyLinkedListNodeValue>> Nodes { get; init; }
}
