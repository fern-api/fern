using System.Text.Json;
using System.Text.Json.Serialization;
using SeedLicense.Core;

namespace SeedLicense;

/// <summary>
/// A simple type with just a name.
/// </summary>
public record Type
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

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
