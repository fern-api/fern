using System.Text.Json;
using System.Text.Json.Serialization;
using SeedResponseProperty.Core;

namespace SeedResponseProperty;

[Serializable]
public record Response
{
    [JsonPropertyName("data")]
    public required Movie Data { get; set; }

    [JsonPropertyName("metadata")]
    public Dictionary<string, string> Metadata { get; set; } = new Dictionary<string, string>();

    [JsonPropertyName("docs")]
    public required string Docs { get; set; }

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
