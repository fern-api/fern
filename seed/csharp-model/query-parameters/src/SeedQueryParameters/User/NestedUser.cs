using System.Text.Json;
using System.Text.Json.Serialization;
using SeedQueryParameters.Core;

namespace SeedQueryParameters;

public record NestedUser
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("user")]
    public required User User { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
