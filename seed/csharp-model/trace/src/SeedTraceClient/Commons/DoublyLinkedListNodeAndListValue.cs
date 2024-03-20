using System.Text.Json.Serialization
using SeedTraceClient

namespace SeedTraceClient

public class DoublyLinkedListNodeAndListValue
{
    [JsonPropertyName("nodeId")]
    public string NodeId { get; init; }

    [JsonPropertyName("fullList")]
    public DoublyLinkedListValue FullList { get; init; }
}
