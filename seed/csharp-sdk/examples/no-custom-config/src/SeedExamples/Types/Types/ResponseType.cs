using System.Text.Json;
using System.Text.Json.Serialization;
using OneOf;
using SeedExamples.Core;

namespace SeedExamples;

public record ResponseType
{
    [JsonPropertyName("type")]
    public required OneOf<BasicType, ComplexType> Type { get; set; }

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
