using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record DoublyLinkedListNodeValue
{
    [JsonPropertyName("nodeId")]
    public required string NodeId { get; set; }

    [JsonPropertyName("val")]
    public required double Val { get; set; }

    [JsonPropertyName("next")]
    public string? Next { get; set; }

    [JsonPropertyName("prev")]
    public string? Prev { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
