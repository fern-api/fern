using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record DoublyLinkedListNodeValue
{
    [JsonPropertyName("nodeId")]
    public required string NodeId { get; }

    [JsonPropertyName("val")]
    public required double Val { get; }

    [JsonPropertyName("next")]
    public string? Next { get; }

    [JsonPropertyName("prev")]
    public string? Prev { get; }
}
