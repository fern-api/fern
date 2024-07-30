using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record SinglyLinkedListNodeValue
{
    [JsonPropertyName("nodeId")]
    public required string NodeId { get; }

    [JsonPropertyName("val")]
    public required double Val { get; }

    [JsonPropertyName("next")]
    public string? Next { get; }
}
