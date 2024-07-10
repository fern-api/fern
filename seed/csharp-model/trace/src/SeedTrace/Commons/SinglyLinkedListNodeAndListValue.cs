using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record SinglyLinkedListNodeAndListValue
{
    [JsonPropertyName("nodeId")]
    public required string NodeId { get; init; }

    [JsonPropertyName("fullList")]
    public required SinglyLinkedListValue FullList { get; init; }
}
