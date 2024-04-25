using System.Text.Json.Serialization;

namespace SeedTrace;

public class DoublyLinkedListNodeValue
{
    [JsonPropertyName("nodeId")]
    public string NodeId { get; init; }

    [JsonPropertyName("val")]
    public double Val { get; init; }

    [JsonPropertyName("next")]
    public List<string?> Next { get; init; }

    [JsonPropertyName("prev")]
    public List<string?> Prev { get; init; }
}
