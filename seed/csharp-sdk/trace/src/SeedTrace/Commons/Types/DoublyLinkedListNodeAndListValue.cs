using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record DoublyLinkedListNodeAndListValue
{
    [JsonPropertyName("nodeId")]
    public required string NodeId { get; init; }

    [JsonPropertyName("fullList")]
    public required DoublyLinkedListValue FullList { get; init; }
}
