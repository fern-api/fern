using System.Text.Json;
using System.Text.Json.Serialization;
using SeedNurseryApi.Core;

namespace SeedNurseryApi;

public record Record
{
    [JsonPropertyName("foo")]
    public Dictionary<string, string> Foo { get; set; } = new Dictionary<string, string>();

    [JsonPropertyName("3d")]
    public required int _3D { get; set; }

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
