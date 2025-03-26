using System.Text.Json;
using System.Text.Json.Serialization;
using SeedPathParameters.Core;

namespace SeedPathParameters;

public record User
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("tags")]
    public IEnumerable<string> Tags { get; set; } = new List<string>();

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
