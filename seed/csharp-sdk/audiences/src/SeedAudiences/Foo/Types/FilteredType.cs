using System.Text.Json;
using System.Text.Json.Serialization;
using SeedAudiences.Core;

namespace SeedAudiences;

public record FilteredType
{
    [JsonPropertyName("public_property")]
    public string? PublicProperty { get; set; }

    [JsonPropertyName("private_property")]
    public required int PrivateProperty { get; set; }

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
