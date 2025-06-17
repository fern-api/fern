using System.Text.Json;
using System.Text.Json.Serialization;
using SeedServerSentEvents.Core;

namespace SeedServerSentEvents;

[Serializable]
public record StreamedCompletion
{
    [JsonPropertyName("delta")]
    public required string Delta { get; set; }

    [JsonPropertyName("tokens")]
    public int? Tokens { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
