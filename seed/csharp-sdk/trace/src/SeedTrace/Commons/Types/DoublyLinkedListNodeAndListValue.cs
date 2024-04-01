using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class DoublyLinkedListNodeAndListValue
{
    [JsonPropertyName("nodeId")]
    public string NodeId { get; init; }

    [JsonPropertyName("fullList")]
    public DoublyLinkedListValue FullList { get; init; }
}
