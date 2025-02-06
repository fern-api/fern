using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record SinglyLinkedListNodeAndListValue
{
    [JsonPropertyName("nodeId")]
    public required string NodeId { get; set; }

    [JsonPropertyName("fullList")]
    public required SinglyLinkedListValue FullList { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
