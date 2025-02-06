using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record DoublyLinkedListNodeAndListValue
{
    [JsonPropertyName("nodeId")]
    public required string NodeId { get; set; }

    [JsonPropertyName("fullList")]
    public required DoublyLinkedListValue FullList { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
