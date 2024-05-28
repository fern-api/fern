using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class SinglyLinkedListNodeAndListValue
{
    [JsonPropertyName("nodeId")]
    public string NodeId { get; init; }

    [JsonPropertyName("fullList")]
    public SinglyLinkedListValue FullList { get; init; }
}
