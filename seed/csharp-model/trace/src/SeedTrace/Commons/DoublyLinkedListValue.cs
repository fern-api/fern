using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record DoublyLinkedListValue
{
    [JsonPropertyName("head")]
    public string? Head { get; set; }

    [JsonPropertyName("nodes")]
    public Dictionary<string, DoublyLinkedListNodeValue> Nodes { get; set; } =
        new Dictionary<string, DoublyLinkedListNodeValue>();

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
