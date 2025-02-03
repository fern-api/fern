using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record SinglyLinkedListValue
{
    [JsonPropertyName("head")]
    public string? Head { get; set; }

    [JsonPropertyName("nodes")]
    public Dictionary<string, SinglyLinkedListNodeValue> Nodes { get; set; } =
        new Dictionary<string, SinglyLinkedListNodeValue>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
