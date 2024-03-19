using System.Text.Json.Serialization
using SeedTraceClient

namespace SeedTraceClient

public class SinglyLinkedListNodeAndListValue
{
    [JsonPropertyName("nodeId")]
    public string NodeId { get; init; }
    [JsonPropertyName("fullList")]
    public SinglyLinkedListValue FullList { get; init; }
}
