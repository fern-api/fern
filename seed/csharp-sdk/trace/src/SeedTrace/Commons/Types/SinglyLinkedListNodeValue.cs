using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record SinglyLinkedListNodeValue
{
    [JsonPropertyName("nodeId")]
    public required string NodeId { get; init; }

    [JsonPropertyName("val")]
    public required double Val { get; init; }

    [JsonPropertyName("next")]
    public string? Next { get; init; }
}
