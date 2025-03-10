using System.Text.Json;
using System.Text.Json.Serialization;
using SeedServerSentEvents.Core;

namespace SeedServerSentEvents;

public record StreamCompletionRequest
{
    [JsonPropertyName("query")]
    public required string Query { get; set; }

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
