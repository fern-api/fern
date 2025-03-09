using System.Text.Json;
using System.Text.Json.Serialization;
using SeedMixedFileDirectory.Core;

namespace SeedMixedFileDirectory.User.Events;

public record Metadata
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("value")]
    public required object Value { get; set; }

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
