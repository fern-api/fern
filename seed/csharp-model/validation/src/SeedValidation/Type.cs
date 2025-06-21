using System.Text.Json;
using System.Text.Json.Serialization;
using SeedValidation.Core;

namespace SeedValidation;

/// <summary>
/// Defines properties with default values and validation rules.
/// </summary>
[Serializable]
public record Type
{
    [JsonPropertyName("decimal")]
    public required double Decimal { get; set; }

    [JsonPropertyName("even")]
    public required int Even { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("shape")]
    public required Shape Shape { get; set; }

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
