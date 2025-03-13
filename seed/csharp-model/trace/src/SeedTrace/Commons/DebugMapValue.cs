using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record DebugMapValue
{
    [JsonPropertyName("keyValuePairs")]
    public IEnumerable<DebugKeyValuePairs> KeyValuePairs { get; set; } =
        new List<DebugKeyValuePairs>();

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
