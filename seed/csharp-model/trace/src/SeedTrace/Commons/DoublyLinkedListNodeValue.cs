using System.Text.Json.Serialization;

#nullable enable

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
}
