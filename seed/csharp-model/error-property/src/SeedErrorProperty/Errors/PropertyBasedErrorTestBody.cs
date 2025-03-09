using System.Text.Json;
using System.Text.Json.Serialization;
using SeedErrorProperty.Core;

namespace SeedErrorProperty;

public record PropertyBasedErrorTestBody
{
    [JsonPropertyName("message")]
    public required string Message { get; set; }

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
