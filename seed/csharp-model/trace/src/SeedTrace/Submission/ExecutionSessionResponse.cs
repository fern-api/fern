using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record ExecutionSessionResponse
{
    [JsonPropertyName("sessionId")]
    public required string SessionId { get; set; }

    [JsonPropertyName("executionSessionUrl")]
    public string? ExecutionSessionUrl { get; set; }

    [JsonPropertyName("language")]
    public required Language Language { get; set; }

    [JsonPropertyName("status")]
    public required ExecutionSessionStatus Status { get; set; }

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
