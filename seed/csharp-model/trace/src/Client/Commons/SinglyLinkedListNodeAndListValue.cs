using System.Text.Json.Serialization;
using Client;

namespace Client;

public class SinglyLinkedListNodeAndListValue
{
    [JsonPropertyName("nodeId")]
    public string NodeId { get; init; }

    [JsonPropertyName("fullList")]
    public SinglyLinkedListValue FullList { get; init; }
}
