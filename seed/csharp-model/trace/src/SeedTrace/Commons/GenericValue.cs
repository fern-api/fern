using System.Text.Json.Serialization;
using System.Text.Json;
using SeedTrace.Core;

namespace SeedTrace;

public record GenericValue
{
    [JsonPropertyName("stringifiedType")]
    public string? StringifiedType { get; set; }

    [JsonPropertyName("stringifiedValue")]
    public required string StringifiedValue { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } = new Dictionary<string, JsonElement>();
    /// <inheritdoc />
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
