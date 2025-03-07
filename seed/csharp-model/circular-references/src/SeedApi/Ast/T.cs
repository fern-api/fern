using System.Text.Json;
using System.Text.Json.Serialization;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

public record T
{
    [JsonPropertyName("child")]
    public required OneOf<T, U> Child { get; set; }

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
