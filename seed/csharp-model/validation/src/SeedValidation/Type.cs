using System.Text.Json;
using System.Text.Json.Serialization;
using SeedValidation.Core;

namespace SeedValidation;

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
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
