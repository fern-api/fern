using System.Text.Json;
using System.Text.Json.Serialization;
using SeedStreaming.Core;

namespace SeedStreaming;

public record Generateequest
{
    [JsonPropertyName("stream")]
    public bool Stream { get; set; } = false;

    [JsonPropertyName("num_events")]
    public required int NumEvents { get; set; }

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
