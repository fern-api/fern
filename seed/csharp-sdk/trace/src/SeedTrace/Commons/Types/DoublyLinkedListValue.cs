using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record DoublyLinkedListValue
{
    [JsonPropertyName("head")]
    public string? Head { get; set; }

    [JsonPropertyName("nodes")]
    public Dictionary<string, DoublyLinkedListNodeValue> Nodes { get; set; } =
        new Dictionary<string, DoublyLinkedListNodeValue>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
