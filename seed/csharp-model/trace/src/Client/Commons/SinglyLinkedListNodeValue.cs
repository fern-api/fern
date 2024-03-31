using System.Text.Json.Serialization;

namespace Client;

public class SinglyLinkedListNodeValue
{
    [JsonPropertyName("nodeId")]
    public string NodeId { get; init; }

    [JsonPropertyName("val")]
    public double Val { get; init; }

    [JsonPropertyName("next")]
    public string? Next { get; init; }
}
